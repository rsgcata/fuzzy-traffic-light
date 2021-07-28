**Control the traffic in an intersection using fuzzy logic**

The system for controlling traffic lights using fuzzy logic, has the following
characteristics:
- the system has 2 streets, each with 2 lanes on which cars can drive in both
ways
- cars cannot turn left or right, they are going in one direction only
- cars coming from the north can only go south
- cars coming from the south can only go north
- cars coming from the east will only go west
- cars coming from the west can only go east
- the maximum number of cars that can wait is 10
- the intersection has 4 traffic lights, one for each direction of travel
- the traffic lights will use only 2 colors (green that allows cars to drive in their direction
and red that stops cars from moving in their direction)
- the main street is the vertical one
- the maximum duration for the green light is 20 seconds, the minimum is 3 seconds

Input variables:
- number of cars waiting at the traffic lights (red color on their direction)
- number of cars to pass the traffic light is green
- degree of visibility (fog)

Output variable
- time in seconds for the green light

TO INITIALIZE A NEW SIMULATION, REFRESH THE PAGE