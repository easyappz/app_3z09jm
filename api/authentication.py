from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import json
from typing import Optional, Tuple
from django.conf import settings
from rest_framework import authentication, exceptions

ALGO = 'HS256'

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def generate_jwt(payload: dict, expires_in_seconds: int = 3600) -> str:
    header = { 'typ': 'JWT', 'alg': ALGO }
    now = datetime.now(timezone.utc)
    payload = { **payload, 'iat': int(now.timestamp()), 'exp': int((now + timedelta(seconds=expires_in_seconds)).timestamp()) }
    header_b64 = _b64url(json.dumps(header, separators=(',', ':')).encode())
    payload_b64 = _b64url(json.dumps(payload, separators=(',', ':')).encode())
    to_sign = f"{header_b64}.{payload_b64}".encode()
    sig = hmac.new(settings.SECRET_KEY.encode(), to_sign, hashlib.sha256).digest()
    signature_b64 = _b64url(sig)
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_jwt(token: str) -> dict:
    try:
        header_b64, payload_b64, signature_b64 = token.split('.')
    except ValueError:
        raise exceptions.AuthenticationFailed('Invalid token')
    to_sign = f"{header_b64}.{payload_b64}".encode()
    expected_sig = _b64url(hmac.new(settings.SECRET_KEY.encode(), to_sign, hashlib.sha256).digest())
    if not hmac.compare_digest(expected_sig, signature_b64):
        raise exceptions.AuthenticationFailed('Invalid signature')
    payload = json.loads(_b64url_decode(payload_b64))
    now = int(datetime.now(timezone.utc).timestamp())
    if 'exp' in payload and now > int(payload['exp']):
        raise exceptions.AuthenticationFailed('Token expired')
    return payload

class JWTAuthentication(authentication.BaseAuthentication):
    keyword = 'Bearer'
    def authenticate(self, request) -> Optional[Tuple[object, None]]:
        auth = authentication.get_authorization_header(request).decode()
        if not auth:
            return None
        parts = auth.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise exceptions.AuthenticationFailed('Invalid Authorization header')
        payload = verify_jwt(parts[1])
        from api.models import Member
        member_id = payload.get('member_id')
        if not member_id:
            raise exceptions.AuthenticationFailed('Invalid payload')
        try:
            user = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')
        return (user, None)
