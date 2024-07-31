/**
 * MasterController.js
 * @description :: exports action methods for Master.
 */

const Master = require('../../model/Master');
const MasterSchemaKey = require('../../utils/validation/MasterValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const deleteDependentService = require('../../utils/deleteDependent');
const utils = require('../../utils/common');

/**
 * @description : create record of Master in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Master. {status, message, data}
 */ 
const addMaster = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      MasterSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdMaster = await dbService.createOne(Master,dataToCreate);
    return  res.success({ data :createdMaster });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Master in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Masters. {status, message, data}
 */
const bulkInsertMaster = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdMaster = await dbService.createMany(Master,dataToCreate); 
      return  res.success({ data :{ count :createdMaster.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Master from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Master(s). {status, message, data}
 */
const findAllMaster = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundMaster;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      MasterSchemaKey.findFilterKeys,
      Master.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundMaster = await dbService.count(Master, query);
      if (!foundMaster) {
        return res.recordNotFound();
      } 
      foundMaster = { totalRecords: foundMaster };
      return res.success({ data :foundMaster });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundMaster = await dbService.paginate( Master,query,options);
    if (!foundMaster){
      return res.recordNotFound();
    }
    return res.success({ data:foundMaster }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Master from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Master. {status, message, data}
 */
const getMaster = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundMaster = await dbService.findOne(Master,{ id :id });
    if (!foundMaster){
      return res.recordNotFound();
    }
    return  res.success({ data :foundMaster });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Master.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getMasterCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      MasterSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedMaster = await dbService.count(Master,where);
    if (!countedMaster){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedMaster } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Master with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Master.
 * @return {Object} : updated Master. {status, message, data}
 */
const updateMaster = async (req, res) => {
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
      MasterSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedMaster = await dbService.update(Master,query,dataToUpdate);
    return  res.success({ data :updatedMaster }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Master with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Masters.
 * @return {Object} : updated Masters. {status, message, data}
 */
const bulkUpdateMaster = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedMaster = await dbService.update(Master,filter,dataToUpdate);
    if (!updatedMaster){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedMaster.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Master with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Master.
 * @return {Object} : updated Master. {status, message, data}
 */
const partialUpdateMaster = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      MasterSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedMaster = await dbService.update(Master, query, dataToUpdate);
    if (!updatedMaster) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Master from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Master.
 * @return {Object} : deactivated Master. {status, message, data}
 */
const softDeleteMaster = async (req, res) => {
  try {
    if (!req.params || !req.params.id) {
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }              
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let updatedMaster = await deleteDependentService.softDeleteMaster(query, updateBody);
    if (!updatedMaster){
      return res.recordNotFound();
    }
    return  res.success({ data :updatedMaster });

  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Master from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Master. {status, message, data}
 */
const deleteMaster = async (req, res) => {
  try {
    let dataToDeleted = req.body;
    let query = { id:req.params.id };
    if (dataToDeleted && dataToDeleted.isWarning) {
      let countedMaster = await deleteDependentService.countMaster(query);
      if (!countedMaster){
        return res.recordNotFound();
      }
      return res.success({ data :countedMaster });
    }
    let deletedMaster = await deleteDependentService.deleteUser(query);
    if (!deletedMaster){
      return res.recordNotFound(); 
    }
    return  res.success({ data :deletedMaster });    
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }

};

/**
 * @description : delete records of Master in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyMaster = async (req, res) => {
  try {
    let dataToDelete = req.body;
    let query = {};
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids field is required.' });
    }                              
    query = { id:{ $in:dataToDelete.ids } };
    if (dataToDelete.isWarning){
      let countedMaster = await deleteDependentService.countMaster(query);
      if (!countedMaster) {
        return res.recordNotFound();
      }
      return res.success({ data: countedMaster });            
    }
    let deletedMaster = await deleteDependentService.deleteMaster(query);
    if (!deletedMaster) {
      return res.recordNotFound();
    }
    return res.success({ data: deletedMaster });          
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Master from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Master.
 * @return {Object} : number of deactivated documents of Master. {status, message, data}
 */
const softDeleteManyMaster = async (req, res) => {
  try {
    let dataToUpdate = req.body;
    let query = {};
    if (!req.params || !req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }            
    query = { id:{ $in:dataToUpdate.ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let updatedMaster = await deleteDependentService.softDeleteMaster(query, updateBody);
    if (!updatedMaster) {
      return res.recordNotFound();
    }
    return  res.success({ data :updatedMaster });

  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addMaster,
  bulkInsertMaster,
  findAllMaster,
  getMaster,
  getMasterCount,
  updateMaster,
  bulkUpdateMaster,
  partialUpdateMaster,
  softDeleteMaster,
  deleteMaster,
  deleteManyMaster,
  softDeleteManyMaster,
};
