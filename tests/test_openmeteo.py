import requests

from sources.openmeteo import is_retryable


def test_an_unreadable_response_body_is_retried() -> None:
    assert is_retryable(requests.JSONDecodeError("Expecting value", "", 0))


def test_a_timeout_is_retried() -> None:
    assert is_retryable(requests.Timeout())


def test_a_bad_request_is_not_retried() -> None:
    response = requests.Response()
    response.status_code = 400

    assert not is_retryable(requests.HTTPError(response=response))
