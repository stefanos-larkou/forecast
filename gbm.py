import numpy as np

from constants import BOOSTING_ROUNDS, LEARNING_RATE, MIN_LEAF_ROWS, TREE_MAX_DEPTH


def best_split(features: np.ndarray, target: np.ndarray) -> tuple[int, float, float] | None:
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

        allowed = (values[:-1] < values[1:]) & (left_count >= MIN_LEAF_ROWS) & (right_count >= MIN_LEAF_ROWS)
        if not allowed.any():
            continue

        position = int(np.argmin(np.where(allowed, error, np.inf)))
        if best is None or error[position] < best[2]:
            best = (column, float((values[position] + values[position + 1]) / 2), float(error[position]))

    return best


def grow(features: np.ndarray, target: np.ndarray, depth: int) -> dict:
    split = best_split(features, target) if depth > 0 else None
    if split is None:
        return {"value": float(target.mean())}

    column, threshold, _ = split
    goes_left = features[:, column] <= threshold

    return {
        "feature": column,
        "threshold": threshold,
        "left": grow(features[goes_left], target[goes_left], depth - 1),
        "right": grow(features[~goes_left], target[~goes_left], depth - 1)
    }


def predict_tree(tree: dict, features: np.ndarray) -> np.ndarray:
    if "value" in tree:
        return np.full(len(features), tree["value"])

    goes_left = features[:, tree["feature"]] <= tree["threshold"]
    predictions = np.empty(len(features))
    predictions[goes_left] = predict_tree(tree["left"], features[goes_left])
    predictions[~goes_left] = predict_tree(tree["right"], features[~goes_left])

    return predictions


def fit(features: np.ndarray, target: np.ndarray) -> list[dict]:
    trees = []
    prediction = np.zeros(len(target))

    for _ in range(BOOSTING_ROUNDS):
        tree = grow(features, target - prediction, TREE_MAX_DEPTH)
        prediction = prediction + LEARNING_RATE * predict_tree(tree, features)
        trees.append(tree)

    return trees


def predict(trees: list[dict], features: np.ndarray) -> np.ndarray:
    return LEARNING_RATE * sum(predict_tree(tree, features) for tree in trees)
