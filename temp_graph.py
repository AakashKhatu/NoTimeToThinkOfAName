from matplotlib import pyplot as plt
import numpy as np
from scipy.stats import linregress
from data import x_data, y_data, z_data

plt.style.use("seaborn")

xmin = x_data[0][0]
xmax = x_data[-1][0]
ymin = -1
ymax = 2

# manually set variables, to be set after analysing data
y_tolerance = 0.01
base_offset = 50


# calculates lower tolerance line for calculating pothole offsets
# common for both upper and lower tol lines
lower_tolerance_line_x = x_data[:, 0]

# y of lower
line = linregress([y_data[0][0], y_data[-1][0]],
                  [y_data[0][1]-y_tolerance, y_data[-1][1]-y_tolerance])
m = line.slope
c = line.intercept
lower_tolerance_line_y = m*lower_tolerance_line_x+c

# y of upper
line = linregress([y_data[0][0], y_data[-1][0]],
                  [y_data[0][1]+y_tolerance, y_data[-1][1]+y_tolerance])
m = line.slope
c = line.intercept
upper_tolerance_line_y = m*lower_tolerance_line_x+c

higher_y_data = np.array([[i[0], i[1]]
                          for n, i in enumerate(y_data) if i[1] >= upper_tolerance_line_y[n]])

# score = mod(2*mod_y-average_y)*base_offset


def slide1():
    plt.plot(*zip(*x_data), color="red")
    plt.annotate("X - Axis Data", (x_data[0][0], x_data[0][1]-0.14))
    # y - axis accelerometer data
    plt.plot(*zip(*y_data), color="orange", label="y_acc_data")
    plt.annotate("Y - Axis Data", (y_data[0][0], y_data[0][1]))
    plt.plot(*zip(*z_data), color="blue")
    plt.annotate("Z - Axis Data", (z_data[0][0], z_data[0][1]))
    ax = plt.gca()
    ax.set_xlim([xmin, xmax])
    ax.set_ylim([ymin, ymax])
    plt.title("Sensor Data")
    plt.xlabel("Time")
    plt.ylabel("Accelerometer reading")
    plt.show()


def slide2():
    plt.plot(*zip(*y_data), color="orange", label="y_acc_data")
    plt.plot(lower_tolerance_line_x,
             lower_tolerance_line_y, color="red", linestyle="--", lw=0.5, label="lower_tol_line")  # y tolerance line axis accelerometer data
    plt.plot(lower_tolerance_line_x,
             upper_tolerance_line_y, color="red", linestyle="--", lw=0.5, label="upper_tol_line")
    plt.plot(*zip(*higher_y_data), color="red",
             linestyle="-", lw=2, label="lower_tol_line")
    ax = plt.gca()
    ax.set_xlim([xmin, xmax])
    ax.set_ylim([ymin, ymax])
    plt.title("Sensor Data")
    plt.xlabel("Time")
    plt.ylabel("Accelerometer reading")
    plt.show()


def slide3():
    plt.plot(lower_tolerance_line_x,
             lower_tolerance_line_y, color="red", linestyle="-", lw=0.5, label="upper_tol_line")  # y tolerance line axis accelerometer data
    # plt.plot(*zip(*higher_y_data), color="red",s
    plt.hlines(
        y=average_y, xmin=higher_y_data[0][0], xmax=higher_y_data[-1][0])
    plt.annotate(str(average_y), (higher_y_data[0][0], average_y))
    ax = plt.gca()
    ax.set_xlim([xmin, xmax])
    ax.set_ylim([ymin, ymax])
    plt.title("Sensor Data")
    plt.xlabel("Time")
    plt.ylabel("Accelerometer reading")
    plt.show()


def display_graph():
    # plt.plot(*zip(*x_data), color="r")
    # y - axis accelerometer data
    plt.plot(*zip(*y_data), color="orange", label="y_acc_data")
    # plt.plot(*zip(*z_data), color="b")
    plt.plot(lower_tolerance_line_x,
             lower_tolerance_line_y, color="red", linestyle="--", lw=0.5, label="upper_tol_line")  # y tolerance line axis accelerometer data
    plt.plot(*zip(*higher_y_data), color="red",
             linestyle="-", lw=2, label="upper_tol_line")
    ax = plt.gca()
    ax.set_xlim([xmin, xmax])
    plt.title("Sensor Data")
    plt.xlabel("Time")
    plt.ylabel("Accelerometer reading")
    plt.show()


slide1()
slide2()
higher_y_data[:, 1] = np.exp(higher_y_data[:, 1])
higher_y_data[:, 1] -= higher_y_data[0][1] - y_data[0][1]
slide2()
average_y = sum(higher_y_data[:, 1])/len(higher_y_data)
print(average_y)
slide3()
