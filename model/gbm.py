import numpy as np

from constants import HYPERPARAMETERS, Hyperparameters


def best_split(features: np.ndarray, target: np.ndarray, min_leaf_rows: int) -> tuple[int, float, float] | None:
    rows = len(target)
    left_count = np.arange(1, rows)
    right_count = rows - left_count
    best = None

    for column in range(features.shape[1]):
        order = np.argsort(features[:, column], kind="stable")
        values = features[order, column]
        ordered = target[order]

        left_sum = np.cumsum(ordered)[:-1]
        left_squares = np.cumsum(ordered ** 2)[:-1]
        right_sum = ordered.sum() - left_sum
        right_squares = (ordered ** 2).sum() - left_squares
        error = (left_squares - left_sum ** 2 / left_count) + (right_squares - right_sum ** 2 / right_count)

        allowed = (values[:-1] < values[1:]) & (left_count >= min_leaf_rows) & (right_count >= min_leaf_rows)
        if not allowed.any():
            continue

        position = int(np.argmin(np.where(allowed, error, np.inf)))
        if best is None or error[position] < best[2]:
            best = (column, float((values[position] + values[position + 1]) / 2), float(error[position]))

    return best


def leaf_value(residuals: np.ndarray, quantile: float | None, learning_rate: float) -> float:
    return float(learning_rate * (residuals.mean() if quantile is None else np.quantile(residuals, quantile)))


def grow(features: np.ndarray, gradients: np.ndarray, residuals: np.ndarray, depth: int, quantile: float | None, settings: Hyperparameters) -> dict:
    split = best_split(features, gradients, settings.min_leaf_rows) if depth > 0 else None
    if split is None:
        return {"value": leaf_value(residuals, quantile, settings.learning_rate)}

    column, threshold, _ = split
    goes_left = features[:, column] <= threshold

    return {
        "feature": column,
        "threshold": threshold,
        "left": grow(features[goes_left], gradients[goes_left], residuals[goes_left], depth - 1, quantile, settings),
        "right": grow(features[~goes_left], gradients[~goes_left], residuals[~goes_left], depth - 1, quantile, settings)
    }


def predict_tree(tree: dict, features: np.ndarray) -> np.ndarray:
    if "value" in tree:
        return np.full(len(features), tree["value"])

    goes_left = features[:, tree["feature"]] <= tree["threshold"]
    predictions = np.empty(len(features))
    predictions[goes_left] = predict_tree(tree["left"], features[goes_left])
    predictions[~goes_left] = predict_tree(tree["right"], features[~goes_left])

    return predictions


def negative_gradients(residuals: np.ndarray, quantile: float | None) -> np.ndarray:
    return residuals if quantile is None else np.where(residuals <= 0, quantile - 1, quantile)


def fit(features: np.ndarray, target: np.ndarray, quantile: float | None = None, settings: Hyperparameters = HYPERPARAMETERS) -> list[dict]:
    trees = []
    prediction = np.zeros(len(target))

    for _ in range(settings.boosting_rounds):
        residuals = target - prediction
        tree = grow(features, negative_gradients(residuals, quantile), residuals, settings.tree_max_depth, quantile, settings)
        prediction = prediction + predict_tree(tree, features)
        trees.append(tree)

    return trees


def predict(trees: list[dict], features: np.ndarray) -> np.ndarray:
    return sum(predict_tree(tree, features) for tree in trees)
