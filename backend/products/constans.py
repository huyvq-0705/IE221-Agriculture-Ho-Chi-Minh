from __future__ import annotations
from enum import Enum
from django.utils.translation import gettext_lazy as _
from decimal import Decimal

class FieldLengths:
    MAX_LENGTH = 255
    DECIMAL_MAX_DIGITS = 12
    DECIMAL_PLACES = 2
