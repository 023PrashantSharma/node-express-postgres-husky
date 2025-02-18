/**
 * TaskController.js
 * @description :: exports action methods for Task.
 */

const Task = require('../../model/Task');
const TaskSchemaKey = require('../../utils/validation/TaskValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Task in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Task. {status, message, data}
 */ 
const addTask = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      TaskSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdTask = await dbService.createOne(Task,dataToCreate);
    return  res.success({ data :createdTask });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Task in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Tasks. {status, message, data}
 */
const bulkInsertTask = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdTask = await dbService.createMany(Task,dataToCreate); 
      return  res.success({ data :{ count :createdTask.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Task from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Task(s). {status, message, data}
 */
const findAllTask = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundTask;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      TaskSchemaKey.findFilterKeys,
      Task.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundTask = await dbService.count(Task, query);
      if (!foundTask) {
        return res.recordNotFound();
      } 
      foundTask = { totalRecords: foundTask };
      return res.success({ data :foundTask });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundTask = await dbService.paginate( Task,query,options);
    if (!foundTask){
      return res.recordNotFound();
    }
    return res.success({ data:foundTask }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Task from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Task. {status, message, data}
 */
const getTask = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundTask = await dbService.findOne(Task,{ id :id });
    if (!foundTask){
      return res.recordNotFound();
    }
    return  res.success({ data :foundTask });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Task.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getTaskCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      TaskSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedTask = await dbService.count(Task,where);
    if (!countedTask){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedTask } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Task with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Task.
 * @return {Object} : updated Task. {status, message, data}
 */
const updateTask = async (req, res) => {
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
      TaskSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedTask = await dbService.update(Task,query,dataToUpdate);
    return  res.success({ data :updatedTask }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Task with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Tasks.
 * @return {Object} : updated Tasks. {status, message, data}
 */
const bulkUpdateTask = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedTask = await dbService.update(Task,filter,dataToUpdate);
    if (!updatedTask){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedTask.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Task with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Task.
 * @return {Object} : updated Task. {status, message, data}
 */
const partialUpdateTask = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      TaskSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedTask = await dbService.update(Task, query, dataToUpdate);
    if (!updatedTask) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedTask });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Task from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Task.
 * @return {Object} : deactivated Task. {status, message, data}
 */
const softDeleteTask = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Task, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Task from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Task. {status, message, data}
 */
const deleteTask = async (req, res) => {
  const result = await dbService.deleteByPk(Task, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Task in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyTask = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedTask = await dbService.destroy(Task,query);
    return res.success({ data :{ count :deletedTask.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Task from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Task.
 * @return {Object} : number of deactivated documents of Task. {status, message, data}
 */
const softDeleteManyTask = async (req, res) => {
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
    let updatedTask = await dbService.update(Task,query,updateBody, options);
    if (!updatedTask) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedTask.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addTask,
  bulkInsertTask,
  findAllTask,
  getTask,
  getTaskCount,
  updateTask,
  bulkUpdateTask,
  partialUpdateTask,
  softDeleteTask,
  deleteTask,
  deleteManyTask,
  softDeleteManyTask,
};
