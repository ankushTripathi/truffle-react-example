pragma solidity ^0.4.24;

contract SimpleStorage {
  uint storedData;

  event LogChangedValue(uint newValue);

  function set(uint x) public {
    storedData = x;
    emit LogChangedValue(x);
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
