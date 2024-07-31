/**
 * CustomerController.js
 * @description :: exports action methods for Customer.
 */

const Customer = require('../../model/Customer');
const CustomerSchemaKey = require('../../utils/validation/CustomerValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Customer in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Customer. {status, message, data}
 */ 
const addCustomer = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      CustomerSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdCustomer = await dbService.createOne(Customer,dataToCreate);
    return  res.success({ data :createdCustomer });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Customer in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Customers. {status, message, data}
 */
const bulkInsertCustomer = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdCustomer = await dbService.createMany(Customer,dataToCreate); 
      return  res.success({ data :{ count :createdCustomer.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Customer from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Customer(s). {status, message, data}
 */
const findAllCustomer = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundCustomer;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      CustomerSchemaKey.findFilterKeys,
      Customer.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundCustomer = await dbService.count(Customer, query);
      if (!foundCustomer) {
        return res.recordNotFound();
      } 
      foundCustomer = { totalRecords: foundCustomer };
      return res.success({ data :foundCustomer });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundCustomer = await dbService.paginate( Customer,query,options);
    if (!foundCustomer){
      return res.recordNotFound();
    }
    return res.success({ data:foundCustomer }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Customer from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Customer. {status, message, data}
 */
const getCustomer = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundCustomer = await dbService.findOne(Customer,{ id :id });
    if (!foundCustomer){
      return res.recordNotFound();
    }
    return  res.success({ data :foundCustomer });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Customer.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getCustomerCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      CustomerSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedCustomer = await dbService.count(Customer,where);
    if (!countedCustomer){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedCustomer } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Customer with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Customer.
 * @return {Object} : updated Customer. {status, message, data}
 */
const updateCustomer = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body || {} };
    let query = {};
    delete dataToUpdate.addedBy;
    if (!req.params || !req.params.id) {
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }          
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      CustomerSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedCustomer = await dbService.update(Customer,query,dataToUpdate);
    return  res.success({ data :updatedCustomer }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Customer with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Customers.
 * @return {Object} : updated Customers. {status, message, data}
 */
const bulkUpdateCustomer = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedCustomer = await dbService.update(Customer,filter,dataToUpdate);
    if (!updatedCustomer){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedCustomer.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Customer with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Customer.
 * @return {Object} : updated Customer. {status, message, data}
 */
const partialUpdateCustomer = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      CustomerSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedCustomer = await dbService.update(Customer, query, dataToUpdate);
    if (!updatedCustomer) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedCustomer });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Customer from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Customer.
 * @return {Object} : deactivated Customer. {status, message, data}
 */
const softDeleteCustomer = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Customer, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Customer from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Customer. {status, message, data}
 */
const deleteCustomer = async (req, res) => {
  const result = await dbService.deleteByPk(Customer, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Customer in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyCustomer = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedCustomer = await dbService.destroy(Customer,query);
    return res.success({ data :{ count :deletedCustomer.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Customer from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Customer.
 * @return {Object} : number of deactivated documents of Customer. {status, message, data}
 */
const softDeleteManyCustomer = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids){
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }
    const query = { id:{ $in:ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    const options = {};
    let updatedCustomer = await dbService.update(Customer,query,updateBody, options);
    if (!updatedCustomer) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedCustomer.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addCustomer,
  bulkInsertCustomer,
  findAllCustomer,
  getCustomer,
  getCustomerCount,
  updateCustomer,
  bulkUpdateCustomer,
  partialUpdateCustomer,
  softDeleteCustomer,
  deleteCustomer,
  deleteManyCustomer,
  softDeleteManyCustomer,
};
