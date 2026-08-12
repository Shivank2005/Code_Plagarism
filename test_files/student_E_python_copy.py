# student_E_python_copy.py - Same bubble sort logic in Python (cross-language plagiarism)
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp

if __name__ == "__main__":
    data = [64, 34, 25, 12, 22, 11, 90]
    bubble_sort(data)
    for val in data:
        print(val, end=" ")
