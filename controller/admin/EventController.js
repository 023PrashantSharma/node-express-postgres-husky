/**
 * EventController.js
 * @description :: exports action methods for Event.
 */

const Event = require('../../model/Event');
const EventSchemaKey = require('../../utils/validation/EventValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Event in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Event. {status, message, data}
 */ 
const addEvent = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      EventSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdEvent = await dbService.createOne(Event,dataToCreate);
    return  res.success({ data :createdEvent });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Event in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Events. {status, message, data}
 */
const bulkInsertEvent = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdEvent = await dbService.createMany(Event,dataToCreate); 
      return  res.success({ data :{ count :createdEvent.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Event from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Event(s). {status, message, data}
 */
const findAllEvent = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundEvent;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      EventSchemaKey.findFilterKeys,
      Event.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundEvent = await dbService.count(Event, query);
      if (!foundEvent) {
        return res.recordNotFound();
      } 
      foundEvent = { totalRecords: foundEvent };
      return res.success({ data :foundEvent });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundEvent = await dbService.paginate( Event,query,options);
    if (!foundEvent){
      return res.recordNotFound();
    }
    return res.success({ data:foundEvent }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Event from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Event. {status, message, data}
 */
const getEvent = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundEvent = await dbService.findOne(Event,{ id :id });
    if (!foundEvent){
      return res.recordNotFound();
    }
    return  res.success({ data :foundEvent });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Event.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getEventCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      EventSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedEvent = await dbService.count(Event,where);
    if (!countedEvent){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedEvent } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Event with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Event.
 * @return {Object} : updated Event. {status, message, data}
 */
const updateEvent = async (req, res) => {
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
      EventSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedEvent = await dbService.update(Event,query,dataToUpdate);
    return  res.success({ data :updatedEvent }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Event with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Events.
 * @return {Object} : updated Events. {status, message, data}
 */
const bulkUpdateEvent = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedEvent = await dbService.update(Event,filter,dataToUpdate);
    if (!updatedEvent){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedEvent.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Event with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Event.
 * @return {Object} : updated Event. {status, message, data}
 */
const partialUpdateEvent = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      EventSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedEvent = await dbService.update(Event, query, dataToUpdate);
    if (!updatedEvent) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedEvent });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Event from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Event.
 * @return {Object} : deactivated Event. {status, message, data}
 */
const softDeleteEvent = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Event, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Event from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Event. {status, message, data}
 */
const deleteEvent = async (req, res) => {
  const result = await dbService.deleteByPk(Event, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Event in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyEvent = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedEvent = await dbService.destroy(Event,query);
    return res.success({ data :{ count :deletedEvent.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Event from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Event.
 * @return {Object} : number of deactivated documents of Event. {status, message, data}
 */
const softDeleteManyEvent = async (req, res) => {
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
    let updatedEvent = await dbService.update(Event,query,updateBody, options);
    if (!updatedEvent) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedEvent.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addEvent,
  bulkInsertEvent,
  findAllEvent,
  getEvent,
  getEventCount,
  updateEvent,
  bulkUpdateEvent,
  partialUpdateEvent,
  softDeleteEvent,
  deleteEvent,
  deleteManyEvent,
  softDeleteManyEvent,
};
