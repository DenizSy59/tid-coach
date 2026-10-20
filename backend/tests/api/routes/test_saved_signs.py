from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.sign import create_random_saved_sign


def test_create_saved_sign(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {"sign_id": 7}
    response = client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["sign_id"] == data["sign_id"]
    assert "id" in content
    assert "owner_id" in content


def test_create_saved_sign_twice_fails(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {"sign_id": 8}
    first = client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert first.status_code == 200
    second = client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert second.status_code == 409
    assert second.json()["detail"] == "Sign already saved"


def test_create_saved_sign_out_of_range(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json={"sign_id": 226},
    )
    assert response.status_code == 422


def test_read_saved_signs(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json={"sign_id": 9},
    )
    response = client.get(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] >= 1
    assert 9 in [saved_sign["sign_id"] for saved_sign in content["data"]]


def test_read_saved_signs_only_own_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    other_saved_sign = create_random_saved_sign(db)
    response = client.get(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    owner_ids = {saved_sign["owner_id"] for saved_sign in content["data"]}
    assert str(other_saved_sign.owner_id) not in owner_ids


def test_delete_saved_sign(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    client.post(
        f"{settings.API_V1_STR}/saved-signs/",
        headers=normal_user_token_headers,
        json={"sign_id": 10},
    )
    response = client.delete(
        f"{settings.API_V1_STR}/saved-signs/10",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Saved sign removed successfully"


def test_delete_saved_sign_not_found(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/saved-signs/225",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Saved sign not found"


def test_delete_saved_sign_of_another_user_not_found(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    other_saved_sign = create_random_saved_sign(db)
    response = client.delete(
        f"{settings.API_V1_STR}/saved-signs/{other_saved_sign.sign_id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 404


def test_saved_signs_need_login(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/saved-signs/")
    assert response.status_code == 401
