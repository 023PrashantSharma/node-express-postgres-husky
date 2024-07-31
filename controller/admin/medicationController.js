/**
 * medicationController.js
 * @description :: exports action methods for medication.
 */

const Medication = require('../../model/medication');
const medicationSchemaKey = require('../../utils/validation/medicationValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Medication in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Medication. {status, message, data}
 */ 
const addMedication = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      medicationSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];
        
    let createdMedication = await dbService.createOne(Medication,dataToCreate);
    return  res.success({ data :createdMedication });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Medication in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Medications. {status, message, data}
 */
const bulkInsertMedication = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let createdMedication = await dbService.createMany(Medication,dataToCreate); 
      return  res.success({ data :{ count :createdMedication.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Medication from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Medication(s). {status, message, data}
 */
const findAllMedication = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundMedication;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      medicationSchemaKey.findFilterKeys,
      Medication.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundMedication = await dbService.count(Medication, query);
      if (!foundMedication) {
        return res.recordNotFound();
      } 
      foundMedication = { totalRecords: foundMedication };
      return res.success({ data :foundMedication });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundMedication = await dbService.paginate( Medication,query,options);
    if (!foundMedication){
      return res.recordNotFound();
    }
    return res.success({ data:foundMedication }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Medication from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Medication. {status, message, data}
 */
const getMedication = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundMedication = await dbService.findOne(Medication,{ id :id });
    if (!foundMedication){
      return res.recordNotFound();
    }
    return  res.success({ data :foundMedication });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Medication.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getMedicationCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      medicationSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedMedication = await dbService.count(Medication,where);
    if (!countedMedication){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedMedication } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Medication with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Medication.
 * @return {Object} : updated Medication. {status, message, data}
 */
const updateMedication = async (req, res) => {
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
      medicationSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };
    let updatedMedication = await dbService.update(Medication,query,dataToUpdate);
    return  res.success({ data :updatedMedication }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Medication with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Medications.
 * @return {Object} : updated Medications. {status, message, data}
 */
const bulkUpdateMedication = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }
    let updatedMedication = await dbService.update(Medication,filter,dataToUpdate);
    if (!updatedMedication){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedMedication.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Medication with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Medication.
 * @return {Object} : updated Medication. {status, message, data}
 */
const partialUpdateMedication = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      medicationSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };
    let updatedMedication = await dbService.update(Medication, query, dataToUpdate);
    if (!updatedMedication) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedMedication });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Medication from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Medication.
 * @return {Object} : deactivated Medication. {status, message, data}
 */
const softDeleteMedication = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Medication, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Medication from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Medication. {status, message, data}
 */
const deleteMedication = async (req, res) => {
  const result = await dbService.deleteByPk(Medication, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Medication in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyMedication = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedMedication = await dbService.destroy(Medication,query);
    return res.success({ data :{ count :deletedMedication.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Medication from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Medication.
 * @return {Object} : number of deactivated documents of Medication. {status, message, data}
 */
const softDeleteManyMedication = async (req, res) => {
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
    let updatedMedication = await dbService.update(Medication,query,updateBody, options);
    if (!updatedMedication) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedMedication.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addMedication,
  bulkInsertMedication,
  findAllMedication,
  getMedication,
  getMedicationCount,
  updateMedication,
  bulkUpdateMedication,
  partialUpdateMedication,
  softDeleteMedication,
  deleteMedication,
  deleteManyMedication,
  softDeleteManyMedication,
};
