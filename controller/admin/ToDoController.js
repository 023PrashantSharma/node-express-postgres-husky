/**
 * ToDoController.js
 * @description :: exports action methods for ToDo.
 */

const ToDo = require('../../model/ToDo');
const ToDoSchemaKey = require('../../utils/validation/ToDoValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of ToDo in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created ToDo. {status, message, data}
 */ 
const addToDo = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      ToDoSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdToDo = await dbService.createOne(ToDo,dataToCreate);
    return  res.success({ data :createdToDo });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of ToDo in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created ToDos. {status, message, data}
 */
const bulkInsertToDo = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdToDo = await dbService.createMany(ToDo,dataToCreate); 
      return  res.success({ data :{ count :createdToDo.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of ToDo from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found ToDo(s). {status, message, data}
 */
const findAllToDo = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundToDo;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      ToDoSchemaKey.findFilterKeys,
      ToDo.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundToDo = await dbService.count(ToDo, query);
      if (!foundToDo) {
        return res.recordNotFound();
      } 
      foundToDo = { totalRecords: foundToDo };
      return res.success({ data :foundToDo });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundToDo = await dbService.paginate( ToDo,query,options);
    if (!foundToDo){
      return res.recordNotFound();
    }
    return res.success({ data:foundToDo }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of ToDo from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found ToDo. {status, message, data}
 */
const getToDo = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundToDo = await dbService.findOne(ToDo,{ id :id });
    if (!foundToDo){
      return res.recordNotFound();
    }
    return  res.success({ data :foundToDo });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of ToDo.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getToDoCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      ToDoSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedToDo = await dbService.count(ToDo,where);
    if (!countedToDo){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedToDo } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of ToDo with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated ToDo.
 * @return {Object} : updated ToDo. {status, message, data}
 */
const updateToDo = async (req, res) => {
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
      ToDoSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedToDo = await dbService.update(ToDo,query,dataToUpdate);
    return  res.success({ data :updatedToDo }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of ToDo with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated ToDos.
 * @return {Object} : updated ToDos. {status, message, data}
 */
const bulkUpdateToDo = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedToDo = await dbService.update(ToDo,filter,dataToUpdate);
    if (!updatedToDo){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedToDo.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of ToDo with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated ToDo.
 * @return {Object} : updated ToDo. {status, message, data}
 */
const partialUpdateToDo = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      ToDoSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedToDo = await dbService.update(ToDo, query, dataToUpdate);
    if (!updatedToDo) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedToDo });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of ToDo from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of ToDo.
 * @return {Object} : deactivated ToDo. {status, message, data}
 */
const softDeleteToDo = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(ToDo, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of ToDo from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted ToDo. {status, message, data}
 */
const deleteToDo = async (req, res) => {
  const result = await dbService.deleteByPk(ToDo, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of ToDo in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyToDo = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedToDo = await dbService.destroy(ToDo,query);
    return res.success({ data :{ count :deletedToDo.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of ToDo from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of ToDo.
 * @return {Object} : number of deactivated documents of ToDo. {status, message, data}
 */
const softDeleteManyToDo = async (req, res) => {
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
    let updatedToDo = await dbService.update(ToDo,query,updateBody, options);
    if (!updatedToDo) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedToDo.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addToDo,
  bulkInsertToDo,
  findAllToDo,
  getToDo,
  getToDoCount,
  updateToDo,
  bulkUpdateToDo,
  partialUpdateToDo,
  softDeleteToDo,
  deleteToDo,
  deleteManyToDo,
  softDeleteManyToDo,
};
