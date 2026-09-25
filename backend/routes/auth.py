"""
auth.py — JWT-based authentication for MediScan AI.
Provides register, login, and token-refresh endpoints.
Uses bcrypt password hashing and HS256 JWT tokens.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt

try:
    from jose import JWTError, jwt
except ImportError:
    import jwt
    JWTError = jwt.PyJWTError

from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import Session

from database import Base, engine, get_db

router = APIRouter(tags=["Auth"])

# ─── Config ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "mediscan-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# ─── ORM User Model ──────────────────────────────────────────────────────────
class UserRecord(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True)
    email         = Column(String, unique=True, nullable=False, index=True)
    name          = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[UserRecord]:
    """Returns the current authenticated user, or None if unauthenticated."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        return db.query(UserRecord).filter(UserRecord.id == user_id).first()
    except JWTError:
        return None


def require_user(current_user: Optional[UserRecord] = Depends(get_current_user)) -> UserRecord:
    """Dependency that raises 401 if the user is not authenticated."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


# ─── Routes ──────────────────────────────────────────────────────────────────
import uuid


@router.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Creates a new user account and returns a JWT token."""
    existing = db.query(UserRecord).filter(UserRecord.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please log in."
        )

    user = UserRecord(
        id=str(uuid.uuid4()),
        email=payload.email.lower().strip(),
        name=payload.name.strip(),
        hashed_password=_hash_password(payload.password),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _create_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email}
    )


@router.post("/auth/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticates with email + password and returns a JWT token."""
    user = db.query(UserRecord).filter(UserRecord.email == form.username.lower()).first()
    if not user or not _verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please try again."
        )

    token = _create_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email}
    )


@router.post("/auth/login/json", response_model=TokenResponse)
def login_json(payload: RegisterRequest, db: Session = Depends(get_db)):
    """JSON body login (for frontend fetch — avoids OAuth2 form encoding)."""
    user = db.query(UserRecord).filter(UserRecord.email == payload.email.lower()).first()
    if not user or not _verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please try again."
        )

    token = _create_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email}
    )


@router.get("/auth/me", response_model=UserOut)
def get_me(current_user: UserRecord = Depends(require_user)):
    """Returns the currently authenticated user's profile."""
    return UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        created_at=current_user.created_at.isoformat() if current_user.created_at else ""
    )


@router.post("/auth/logout")
def logout():
    """Stateless JWT logout — frontend should delete the token."""
    return {"success": True, "message": "Logged out. Please delete your local token."}
