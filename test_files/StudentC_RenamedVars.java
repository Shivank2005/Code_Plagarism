// StudentC_RenamedVars.java - Same logic, all variables renamed
public class StudentC_RenamedVars {
    public static void sortArray(int[] numbers) {
        int size = numbers.length;
        for (int outer = 0; outer < size - 1; outer++) {
            for (int inner = 0; inner < size - outer - 1; inner++) {
                if (numbers[inner] > numbers[inner + 1]) {
                    int holder = numbers[inner];
                    numbers[inner] = numbers[inner + 1];
                    numbers[inner + 1] = holder;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] values = {64, 34, 25, 12, 22, 11, 90};
        sortArray(values);
        for (int v : values) {
            System.out.print(v + " ");
        }
    }
}
