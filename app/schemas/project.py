from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)


class Project(ProjectBase):
    id: str
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


class ProjectCreate(ProjectBase):
    pass
