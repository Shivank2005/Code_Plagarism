// StudentF_Unrelated.java - Completely different algorithm (Matrix Multiplication)
public class StudentF_Unrelated {
    
    public static int[][] multiply(int[][] matA, int[][] matB) {
        int rows = matA.length;
        int cols = matB[0].length;
        int common = matB.length;
        int[][] result = new int[rows][cols];
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                result[i][j] = 0;
                for (int k = 0; k < common; k++) {
                    result[i][j] += matA[i][k] * matB[k][j];
                }
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3, 4}};
        int[][] b = {{5, 6}, {7, 8}};
        int[][] c = multiply(a, b);
        for (int[] row : c) {
            for (int val : row) {
                System.out.print(val + " ");
            }
            System.out.println();
        }
    }
}
