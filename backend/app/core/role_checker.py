from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User


class RoleChecker:

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role.value not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action."
            )

        return current_user