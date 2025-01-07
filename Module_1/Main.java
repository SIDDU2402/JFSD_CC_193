import java.util.Scanner;
public class Main {

    public static void main(String[] args) {
       String s;
       int age;
       float cgpa;
       Scanner sc = new Scanner(System.in);
         System.out.println("Enter your name: ");
            s = sc.next();
            System.out.println("Enter your age: ");
            age = sc.nextInt();
            System.out.println("Enter your cgpa: ");
            cgpa = sc.nextFloat();
            System.out.println("Name: " + s);
            System.out.println("Age: " + age);
            System.out.println("CGPA: " + cgpa);
            sc.close();
}
}