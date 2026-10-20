from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.sign import create_random_practice_attempt


def test_create_practice_attempt(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {"sign_id": 3}
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["sign_id"] == data["sign_id"]
    # The model is not connected yet, so both stay empty.
    assert content["score"] is None
    assert content["predicted_sign_id"] is None
    assert "owner_id" in content


def test_create_practice_attempt_with_score(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    data = {"sign_id": 4, "score": 82.5, "predicted_sign_id": 11}
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["score"] == 82.5
    assert content["predicted_sign_id"] == 11


def test_create_practice_attempt_rejects_bad_score(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 5, "score": 101},
    )
    assert response.status_code == 422


def test_read_practice_attempts(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 6},
    )
    response = client.get(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] >= 1


def test_read_practice_attempts_only_own_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    other_attempt = create_random_practice_attempt(db)
    response = client.get(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    owner_ids = {attempt["owner_id"] for attempt in content["data"]}
    assert str(other_attempt.owner_id) not in owner_ids


def test_read_progress(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    for score in (40.0, 90.0):
        client.post(
            f"{settings.API_V1_STR}/practice/attempts",
            headers=normal_user_token_headers,
            json={"sign_id": 12, "score": score},
        )
    response = client.get(
        f"{settings.API_V1_STR}/practice/progress",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    rows = [row for row in content["data"] if row["sign_id"] == 12]
    assert len(rows) == 1
    assert rows[0]["times_practised"] >= 2
    assert rows[0]["best_score"] == 90.0
    assert rows[0]["last_practised"] is not None


def test_progress_only_own_data(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    other_attempt = create_random_practice_attempt(db)
    response = client.get(
        f"{settings.API_V1_STR}/practice/progress",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    own_sign_ids = {row["sign_id"] for row in content["data"]}
    # The other user's attempt must not create a row here unless the current
    # user happens to have practised the same sign themselves.
    if other_attempt.sign_id in own_sign_ids:
        attempts = client.get(
            f"{settings.API_V1_STR}/practice/attempts",
            headers=normal_user_token_headers,
        ).json()
        assert other_attempt.sign_id in [a["sign_id"] for a in attempts["data"]]


def test_practice_needs_login(client: TestClient) -> None:
    assert client.get(f"{settings.API_V1_STR}/practice/attempts").status_code == 401
    assert client.get(f"{settings.API_V1_STR}/practice/progress").status_code == 401


def test_attempt_keeps_the_time_it_was_practised(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """An attempt practised offline arrives later but keeps its own time."""
    practised_at = datetime.now(UTC) - timedelta(days=2)
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 21, "practised_at": practised_at.isoformat()},
    )
    assert response.status_code == 200
    stored = datetime.fromisoformat(response.json()["created_at"])
    if stored.tzinfo is None:
        stored = stored.replace(tzinfo=UTC)
    assert abs((stored - practised_at).total_seconds()) < 5


def test_attempt_without_a_time_is_stamped_now(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 22},
    )
    assert response.status_code == 200
    stored = datetime.fromisoformat(response.json()["created_at"])
    if stored.tzinfo is None:
        stored = stored.replace(tzinfo=UTC)
    assert abs((stored - datetime.now(UTC)).total_seconds()) < 60


def test_attempt_rejects_a_time_in_the_future(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    future = datetime.now(UTC) + timedelta(days=1)
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 23, "practised_at": future.isoformat()},
    )
    assert response.status_code == 422


def test_attempt_rejects_a_time_far_in_the_past(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    ancient = datetime.now(UTC) - timedelta(days=400)
    response = client.post(
        f"{settings.API_V1_STR}/practice/attempts",
        headers=normal_user_token_headers,
        json={"sign_id": 24, "practised_at": ancient.isoformat()},
    )
    assert response.status_code == 422
