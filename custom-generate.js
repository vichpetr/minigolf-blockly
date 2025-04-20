// javascript.javascriptGenerator.forBlock['golf_start'] = function (block) {
//   const power = javascript.javascriptGenerator.valueToCode(block, 'POWER',
//     Blockly.JavaScript.ORDER_ATOMIC) || '0';
//   const angle = javascript.javascriptGenerator.valueToCode(block, 'ANGLE',
//     Blockly.JavaScript.ORDER_ATOMIC) || '0';

//   console.log(power);
//   console.log(angle);
//   return `game.queueCommand(${power}, ${angle});\n`;
// };


javascript.javascriptGenerator.forBlock['golf_shot'] = function (block) {
  const power = javascript.javascriptGenerator.valueToCode(block, 'POWER',
    Blockly.JavaScript.ORDER_ATOMIC) || '0';
  const angle = javascript.javascriptGenerator.valueToCode(block, 'ANGLE',
    Blockly.JavaScript.ORDER_ATOMIC) || '0';

    console.log(power);
    console.log(angle);
  return `game.queueCommand(${power}, ${angle});\n`;
};

javascript.javascriptGenerator.forBlock['golf_start'] = function(block) {
  // TODO: change Order.ATOMIC to the correct operator precedence strength
  const value_golf_input_values = javascript.javascriptGenerator.valueToCode(block, 'golf_input_values', javascript.Order.ATOMIC);
  const statement_golf_blocks = javascript.javascriptGenerator.statementToCode(block, 'golf_blocks');

  console.log("value_golf_input_values: ", value_golf_input_values);
  console.log("statement_golf_blocks: ", statement_golf_blocks);

  return statement_golf_blocks;
}
