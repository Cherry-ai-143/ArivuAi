from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import SessionLocal, get_db
from app.models.user import User
from app.repositories.user import UserRepository
from app.core.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)



def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    email = payload.get("sub")

    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    repository = UserRepository(db)

    sub_str = str(email)
    user = repository.get_user_by_email(sub_str)
    if user is None and sub_str.isdigit():
        user = repository.get_user_by_id(int(sub_str))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def get_optional_current_user(
    token: str | None = Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)),
    db: Session = Depends(get_db)
) -> User | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if not payload:
            return None
        sub = payload.get("sub")
        if not sub:
            return None
        repository = UserRepository(db)
        sub_str = str(sub)
        user = repository.get_user_by_email(sub_str)
        if user is None and sub_str.isdigit():
            user = repository.get_user_by_id(int(sub_str))
        return user
    except Exception:
        return None