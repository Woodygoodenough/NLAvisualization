import numpy as np
import json

def create_upper_hessenberg(n=6):
    np.random.seed(42)
    H = np.random.randn(n, n)
    return np.triu(H, -1)

def apply_givens_left(A, i, j, c, s):
    for k in range(A.shape[1]):
        tau1 = A[i, k]
        tau2 = A[j, k]
        A[i, k] = c * tau1 - s * tau2
        A[j, k] = s * tau1 + c * tau2
    return A

def apply_givens_right(A, i, j, c, s):
    for k in range(A.shape[0]):
        tau1 = A[k, i]
        tau2 = A[k, j]
        A[k, i] = c * tau1 - s * tau2
        A[k, j] = s * tau1 + c * tau2
    return A

def givens_rotation(a, b):
    if b == 0:
        return 1.0, 0.0
    if abs(b) > abs(a):
        r = a / b
        s = 1.0 / np.sqrt(1 + r**2)
        c = s * r
    else:
        r = b / a
        c = 1.0 / np.sqrt(1 + r**2)
        s = c * r
    return c, s

def main():
    n = 6
    H = create_upper_hessenberg(n)

    steps = []

    steps.append({
        "title": "Initial Matrix",
        "description": "Start with an upper Hessenberg matrix H.",
        "matrix": np.round(H, 2).tolist(),
        "highlight": [],
        "bulge": None
    })

    A = H.copy()

    for i in range(n - 1):
        target_row = i + 1
        target_col = i if i == 0 else i - 1

        a = A[i, target_col]
        b = A[i+1, target_col]
        c, s = givens_rotation(a, b)

        A = apply_givens_left(A, i, i+1, c, s)
        A[target_row, target_col] = 0.0

        highlight_left = [
            [i, j] for j in range(target_col, n)
        ] + [
            [i+1, j] for j in range(target_col, n)
        ]

        title_left = "Cancel First Subdiagonal" if i == 0 else f"Cancel Bulge at ({target_row}, {target_col})"
        desc_left = f"Apply left Givens rotation on rows {i} and {i+1} to zero out the element at ({target_row}, {target_col})."

        steps.append({
            "title": title_left,
            "description": desc_left,
            "matrix": np.round(A, 2).tolist(),
            "highlight": highlight_left,
            "bulge": None
        })

        A = apply_givens_right(A, i, i+1, c, s)

        bulge_row = i + 2
        bulge_col = i
        has_bulge = (bulge_row < n)

        highlight_right = [
            [k, i] for k in range(0, min(bulge_row + 1, n))
        ] + [
            [k, i+1] for k in range(0, min(bulge_row + 1, n))
        ]

        title_right = "Complete Similarity Transform"
        if has_bulge:
            desc_right = f"Apply right Givens rotation on cols {i} and {i+1}. Because of the non-zero element at ({i+1}, {i+1}), this introduces a new non-zero 'bulge' at ({bulge_row}, {bulge_col})."
        else:
            desc_right = f"Apply right Givens rotation on cols {i} and {i+1}. The bulge falls off the edge. We are back to Upper Hessenberg form!"

        steps.append({
            "title": title_right,
            "description": desc_right,
            "matrix": np.round(A, 2).tolist(),
            "highlight": highlight_right,
            "bulge": [bulge_row, bulge_col] if has_bulge else None
        })

    with open("src/app/bulge-chasing/data.json", "w") as f:
        json.dump(steps, f, indent=2)

if __name__ == "__main__":
    main()
