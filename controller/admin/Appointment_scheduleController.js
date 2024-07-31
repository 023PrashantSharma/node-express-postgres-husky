/**
 * Appointment_scheduleController.js
 * @description :: exports action methods for Appointment_schedule.
 */

const Appointment_schedule = require('../../model/Appointment_schedule');
const Appointment_scheduleSchemaKey = require('../../utils/validation/Appointment_scheduleValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Appointment_schedule in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Appointment_schedule. {status, message, data}
 */ 
const addAppointment_schedule = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      Appointment_scheduleSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdAppointment_schedule = await dbService.createOne(Appointment_schedule,dataToCreate);
    return  res.success({ data :createdAppointment_schedule });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Appointment_schedule in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Appointment_schedules. {status, message, data}
 */
const bulkInsertAppointment_schedule = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdAppointment_schedule = await dbService.createMany(Appointment_schedule,dataToCreate); 
      return  res.success({ data :{ count :createdAppointment_schedule.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Appointment_schedule from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Appointment_schedule(s). {status, message, data}
 */
const findAllAppointment_schedule = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundAppointment_schedule;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      Appointment_scheduleSchemaKey.findFilterKeys,
      Appointment_schedule.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundAppointment_schedule = await dbService.count(Appointment_schedule, query);
      if (!foundAppointment_schedule) {
        return res.recordNotFound();
      } 
      foundAppointment_schedule = { totalRecords: foundAppointment_schedule };
      return res.success({ data :foundAppointment_schedule });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundAppointment_schedule = await dbService.paginate( Appointment_schedule,query,options);
    if (!foundAppointment_schedule){
      return res.recordNotFound();
    }
    return res.success({ data:foundAppointment_schedule }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Appointment_schedule from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Appointment_schedule. {status, message, data}
 */
const getAppointment_schedule = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundAppointment_schedule = await dbService.findOne(Appointment_schedule,{ id :id });
    if (!foundAppointment_schedule){
      return res.recordNotFound();
    }
    return  res.success({ data :foundAppointment_schedule });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Appointment_schedule.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getAppointment_scheduleCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      Appointment_scheduleSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedAppointment_schedule = await dbService.count(Appointment_schedule,where);
    if (!countedAppointment_schedule){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedAppointment_schedule } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Appointment_schedule with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Appointment_schedule.
 * @return {Object} : updated Appointment_schedule. {status, message, data}
 */
const updateAppointment_schedule = async (req, res) => {
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
      Appointment_scheduleSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedAppointment_schedule = await dbService.update(Appointment_schedule,query,dataToUpdate);
    return  res.success({ data :updatedAppointment_schedule }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Appointment_schedule with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Appointment_schedules.
 * @return {Object} : updated Appointment_schedules. {status, message, data}
 */
const bulkUpdateAppointment_schedule = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedAppointment_schedule = await dbService.update(Appointment_schedule,filter,dataToUpdate);
    if (!updatedAppointment_schedule){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedAppointment_schedule.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Appointment_schedule with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Appointment_schedule.
 * @return {Object} : updated Appointment_schedule. {status, message, data}
 */
const partialUpdateAppointment_schedule = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      Appointment_scheduleSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedAppointment_schedule = await dbService.update(Appointment_schedule, query, dataToUpdate);
    if (!updatedAppointment_schedule) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedAppointment_schedule });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Appointment_schedule from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Appointment_schedule.
 * @return {Object} : deactivated Appointment_schedule. {status, message, data}
 */
const softDeleteAppointment_schedule = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Appointment_schedule, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Appointment_schedule from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Appointment_schedule. {status, message, data}
 */
const deleteAppointment_schedule = async (req, res) => {
  const result = await dbService.deleteByPk(Appointment_schedule, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Appointment_schedule in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyAppointment_schedule = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedAppointment_schedule = await dbService.destroy(Appointment_schedule,query);
    return res.success({ data :{ count :deletedAppointment_schedule.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Appointment_schedule from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Appointment_schedule.
 * @return {Object} : number of deactivated documents of Appointment_schedule. {status, message, data}
 */
const softDeleteManyAppointment_schedule = async (req, res) => {
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
    let updatedAppointment_schedule = await dbService.update(Appointment_schedule,query,updateBody, options);
    if (!updatedAppointment_schedule) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedAppointment_schedule.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addAppointment_schedule,
  bulkInsertAppointment_schedule,
  findAllAppointment_schedule,
  getAppointment_schedule,
  getAppointment_scheduleCount,
  updateAppointment_schedule,
  bulkUpdateAppointment_schedule,
  partialUpdateAppointment_schedule,
  softDeleteAppointment_schedule,
  deleteAppointment_schedule,
  deleteManyAppointment_schedule,
  softDeleteManyAppointment_schedule,
};
