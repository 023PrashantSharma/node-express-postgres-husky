/**
 * PlanController.js
 * @description :: exports action methods for Plan.
 */

const Plan = require('../../model/Plan');
const PlanSchemaKey = require('../../utils/validation/PlanValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Plan in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Plan. {status, message, data}
 */ 
const addPlan = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      PlanSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdPlan = await dbService.createOne(Plan,dataToCreate);
    return  res.success({ data :createdPlan });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Plan in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Plans. {status, message, data}
 */
const bulkInsertPlan = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdPlan = await dbService.createMany(Plan,dataToCreate); 
      return  res.success({ data :{ count :createdPlan.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Plan from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Plan(s). {status, message, data}
 */
const findAllPlan = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundPlan;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      PlanSchemaKey.findFilterKeys,
      Plan.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundPlan = await dbService.count(Plan, query);
      if (!foundPlan) {
        return res.recordNotFound();
      } 
      foundPlan = { totalRecords: foundPlan };
      return res.success({ data :foundPlan });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundPlan = await dbService.paginate( Plan,query,options);
    if (!foundPlan){
      return res.recordNotFound();
    }
    return res.success({ data:foundPlan }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Plan from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Plan. {status, message, data}
 */
const getPlan = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundPlan = await dbService.findOne(Plan,{ id :id });
    if (!foundPlan){
      return res.recordNotFound();
    }
    return  res.success({ data :foundPlan });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Plan.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getPlanCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      PlanSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedPlan = await dbService.count(Plan,where);
    if (!countedPlan){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedPlan } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Plan with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Plan.
 * @return {Object} : updated Plan. {status, message, data}
 */
const updatePlan = async (req, res) => {
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
      PlanSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedPlan = await dbService.update(Plan,query,dataToUpdate);
    return  res.success({ data :updatedPlan }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Plan with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Plans.
 * @return {Object} : updated Plans. {status, message, data}
 */
const bulkUpdatePlan = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedPlan = await dbService.update(Plan,filter,dataToUpdate);
    if (!updatedPlan){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedPlan.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Plan with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Plan.
 * @return {Object} : updated Plan. {status, message, data}
 */
const partialUpdatePlan = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      PlanSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedPlan = await dbService.update(Plan, query, dataToUpdate);
    if (!updatedPlan) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedPlan });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Plan from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Plan.
 * @return {Object} : deactivated Plan. {status, message, data}
 */
const softDeletePlan = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Plan, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Plan from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Plan. {status, message, data}
 */
const deletePlan = async (req, res) => {
  const result = await dbService.deleteByPk(Plan, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Plan in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyPlan = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedPlan = await dbService.destroy(Plan,query);
    return res.success({ data :{ count :deletedPlan.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Plan from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Plan.
 * @return {Object} : number of deactivated documents of Plan. {status, message, data}
 */
const softDeleteManyPlan = async (req, res) => {
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
    let updatedPlan = await dbService.update(Plan,query,updateBody, options);
    if (!updatedPlan) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedPlan.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addPlan,
  bulkInsertPlan,
  findAllPlan,
  getPlan,
  getPlanCount,
  updatePlan,
  bulkUpdatePlan,
  partialUpdatePlan,
  softDeletePlan,
  deletePlan,
  deleteManyPlan,
  softDeleteManyPlan,
};
