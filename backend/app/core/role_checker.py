from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User


class RoleChecker:

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    def __call__(
        self,
        current_user: User = Depends(get_current_user)
    ):
        user_role = (
            current_user.role.value
            if hasattr(current_user.role, "value")
            else str(current_user.role)
        ).lower()

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action."
            )

        return current_user