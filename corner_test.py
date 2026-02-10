def getCornerPath(x1, y1, x2, y2, x3, y3, radius):
    dx1 = 1 if x2 > x1 else -1 if x2 < x1 else 0
    dy1 = 1 if y2 > y1 else -1 if y2 < y1 else 0
    dx2 = 1 if x3 > x2 else -1 if x3 < x2 else 0
    dy2 = 1 if y3 > y2 else -1 if y3 < y2 else 0
    r = radius
    startX = x2 - r * dx1
    startY = y2 - r * dy1
    endX = x2 + r * dx2
    endY = y2 + r * dy2
    return f' L {startX} {startY} Q {x2} {y2} {endX} {endY}'

print('RIGHT SIDE ]')
x1, y1 = 200, 100
outX = 250
x2, y2 = 200, 300
print('P1:({x1},{y1}) P2:({outX},{y1}) P3:({outX},{y2}) P4:({x2},{y2})')
print('Corner 1:', getCornerPath(x1, y1, outX, y1, outX, y2, 10))
print('Corner 2:', getCornerPath(outX, y1, outX, y2, x2, y2, 10))
