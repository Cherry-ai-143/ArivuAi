from enum import Enum


class ContentType(str, Enum):
    VIDEO = "VIDEO"
    PDF = "PDF"
    PPT = "PPT"
    DOC = "DOC"
    IMAGE = "IMAGE"
    LINK = "LINK"