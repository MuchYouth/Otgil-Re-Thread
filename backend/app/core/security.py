# app/core/security.py

from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt

# -----------------------------------------------------------
# 설정 값 (실제 배포 시에는 .env 파일 등에서 환경변수로 불러와야 안전합니다)
# -----------------------------------------------------------
SECRET_KEY = "CHANGE_THIS_TO_A_VERY_SECURE_RANDOM_STRING"  # 보안 키 (절대 유출 금지)
ALGORITHM = "HS256"  # 암호화 알고리즘
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 토큰 만료 시간 (30분)


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """
    JWT Access Token을 생성하는 함수
    :param subject: 토큰에 담을 식별자 (보통 user_id나 email)
    :param expires_delta: 만료 시간 (지정하지 않으면 기본값 사용)
    :return: 인코딩된 JWT 문자열
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # JWT payload 생성
    # 'sub' (subject)는 JWT 표준 클레임으로, 주로 식별자를 담습니다.
    to_encode = {"exp": expire, "sub": str(subject)}

    # 비밀키와 알고리즘을 사용해 암호화
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt