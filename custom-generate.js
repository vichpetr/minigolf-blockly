javascript.javascriptGenerator.forBlock['golf_shot'] = function (block) {
  const power = javascript.javascriptGenerator.valueToCode(block, 'POWER',
    Blockly.JavaScript.ORDER_ATOMIC) || '0';
  const angle = javascript.javascriptGenerator.valueToCode(block, 'ANGLE',
    Blockly.JavaScript.ORDER_ATOMIC) || '0';

    console.log(power);
    console.log(angle);
  return `game.applyForce(${power}, ${angle});\n`;
};
