import uuid

def generate_uid() -> str:
    """
    Generate a unique identifier (UID) using UUID4.

    Returns:
        str: A unique identifier as a string.
    """
    return str(uuid.uuid4())