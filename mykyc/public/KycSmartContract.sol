pragma solidity ^0.4.23;
// mykyc contract
contract KycSmartContract {

    struct Customer {
        bytes name;
        bytes email;
        bytes kycData;
        bytes oName;
    }

    
    Customer[] allCustomers;
    
    constructor() public {
        
    }
    function getDataSize() public view returns(uint) {
        uint total = 0;
        for(uint i=0;i<allCustomers.length;i++) {
            total = total + allCustomers[i].name.length + allCustomers[i].email.length + allCustomers[i].kycData.length + allCustomers[i].oName.length;
        }
        return total;
    }
    function checkDeployed() public view returns(bool){
        return true;
    }
    function getDataHash(uint index) public view returns(bytes32) {
        return blockhash(index);
    }
    
    function addCustomer(bytes name,bytes email,bytes kycData,bytes oName) public {
        allCustomers.length ++;
        allCustomers[allCustomers.length-1] = Customer(name,email,kycData,oName);
    }
    
    function getCustomersCount() public view returns (uint){
        return allCustomers.length;
    }
    
    function getCustomerData(uint index) public view returns (bytes name,bytes email,bytes kycData,bytes oName){
       Customer storage c = allCustomers[index];
       return (c.name,c.email,c.kycData,c.oName);
    }
}
