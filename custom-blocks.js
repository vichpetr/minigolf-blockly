const MY_BLOCKS = [
  {
      "type": "golf_shot",
      "message0": "Úder síla: %1 úhel: %2°",
      "args0": [
          {"type": "input_value", "name": "POWER", "check": "Number"},
          {"type": "input_value", "name": "ANGLE", "check": "Number"}
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Proveď golfový úder s danou silou a úhlem"
  },
  {
    "type": "golf_start",
    "tooltip": "",
    "helpUrl": "",
    "message0": "Start kroků %1 %2 %3",
    "args0": [
      {
        "type": "input_dummy",
        "name": "NAME"
      },
      {
        "type": "input_value",
        "name": "golf_input_values"
      },
      {
        "type": "input_statement",
        "name": "golf_blocks",
        "check": "Array"
      }
    ],
    "colour": 225
  }
                      
];