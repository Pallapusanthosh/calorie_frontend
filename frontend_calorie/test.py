from ultralytics import YOLO
model = YOLO("C:/Users/UMA TEJASWI/Desktop/mini_project/calorie_tracker/calorie_tracker-main/server/best.pt")
model.export(format="onnx")
