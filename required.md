# GIC Cinemas Booking System

## Intro

You are building a part of cinema booking management system. You must build a prototype that takes in one movie title and seating map input, before allowing tickets to be booked.

## Application Start

When the application starts, it should ask user to input the movie title and seating map in [Title] [Row] [SeatsPerRow] format. Maximum number of rows is 26, and maximum number of seats per row is 50. Upon entering the required input, the main menu should be shown.

```
Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:
> Inception 8 10

Welcome to GIC Cinemas
[1] Book tickets for Inception (80 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
>
```

## Ticket Booking

When user selects [1], the booking "workflow" should start. User needs to input the desired number of tickets they want to book. If there are not enough seats available, user should be allowed to try again.

After seats are allocated, a booking id should be generated and displayed along with the number of tickets booked and the seating map showing default selected seats. The seats reserved for the current booking should be marked differently than seats taken by existing bookings.

Use the following rules for default seat selection:
- Start from furthest row from the screen.
- Start from the middle-most possible col.
- When a row is not enough to accommodate the number of tickets, it should overflow to the next row closer to the screen.

User can choose another seating position by specifying the starting position of the seats. Seating assignment should follow this rule:
- Starting from the specified position, fill up all empty seats in the same row all the way to the right of the cinema hall.
- When there is not enough seats available, it should overflow to the next row closer to the screen.
- Seat allocation for overflow follows the rules for default seat selection.

The following example demonstrates the ticket booking flow:

```
Welcome to GIC Cinemas
[1] Book tickets for Inception (80 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
> 1

Enter number of tickets to book, or enter blank to go back to main menu:
> 4

Successfully reserved 4 Inception tickets.
Booking id: GIC0001
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . . . . . . . . . .
B . . . . . . . . . .
A . . . . o o o o . .
  1 2 3 4 5 6 7 8 9 10

Enter blank to accept seat selection, or enter new seating position:
> B03

Booking id: GIC0001
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . . . . . . . . . .
B . . o o o o . . . .
A . . . . . . . . . .
  1 2 3 4 5 6 7 8 9 10

Enter blank to accept seat selection, or enter new seating position
>

Booking id: GIC0001 confirmed.

Welcome to GIC Cinemas
[1] Book tickets for Inception (76 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
> 1

Enter number of tickets to book, or enter blank to go back to main menu:
> 77

Sorry, there are only 76 seats available.

Enter number of tickets to book, or enter blank to go back to main menu:
> 12

Successfully reserved 12 Inception tickets.
Booking id: GIC0002
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . . . . . . . . . .
B . . # # # # o o . .
A o o o o o o o o o o
  1 2 3 4 5 6 7 8 9 10

Enter blank to accept seat selection, or enter new seating position
> B05

Booking id: GIC0002
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . o o o o o o o o .
B . . # # # o o o . .
A . . . . . . . . . .
  1 2 3 4 5 6 7 8 9 10

Enter blank to accept seat selection, or enter new seating position
>

Booking id: GIC0002 confirmed.

Welcome to GIC Cinemas
[1] Book tickets for Inception (64 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
```

## Check bookings

When user selects [2], they can enter their booking id to see the selected seats in the seating map.

```
Welcome to GIC Cinemas
[1] Book tickets for Inception (64 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
> 2

Enter booking id, or enter blank to go back to main menu:
> GIC0001

Booking id: GIC0001
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . # # # # # # # # .
B . o o o o # # # # #
A . . . . . . . . . .
  1 2 3 4 5 6 7 8 9 10

Enter booking id, or enter blank to go back to main menu:
> GIC0002

Booking id: GIC0002
Selected seats:

         S C R E E N
-------------------------
H . . . . . . . . . .
G . . . . . . . . . .
F . . . . . . . . . .
E . . . . . . . . . .
D . . . . . . . . . .
C . o o o o o o o o .
B . . # # # o o o . .
A . . . . . . . . . .
  1 2 3 4 5 6 7 8 9 10

Enter booking id, or enter blank to go back to main menu:
>

Welcome to GIC Cinemas
[1] Book tickets for Inception (64 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
>
```

## Exit

User can exit the application by choosing option [3]. A thank you message should be displayed.

```
Welcome to GIC Cinemas
[1] Book tickets for Inception (64 seats available)
[2] Check bookings
[3] Exit
Please enter your selection:
> 3

Thank you for using GIC Cinemas system. Bye!
```