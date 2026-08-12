// StudentD_Restructured.java - Same algorithm, restructured with helper methods
public class StudentD_Restructured {
    
    private static void swap(int[] array, int i, int j) {
        int temporary = array[i];
        array[i] = array[j];
        array[j] = temporary;
    }
    
    private static boolean isOutOfOrder(int a, int b) {
        return a > b;
    }

    public static void performSort(int[] array) {
        int length = array.length;
        boolean swapped;
        for (int pass = 0; pass < length - 1; pass++) {
            swapped = false;
            for (int idx = 0; idx < length - pass - 1; idx++) {
                if (isOutOfOrder(array[idx], array[idx + 1])) {
                    swap(array, idx, idx + 1);
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] input = {64, 34, 25, 12, 22, 11, 90};
        performSort(input);
        for (int num : input) {
            System.out.print(num + " ");
        }
    }
}
