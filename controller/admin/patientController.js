/**
 * patientController.js
 * @description :: exports action methods for patient.
 */

const Patient = require('../../model/patient');
const patientSchemaKey = require('../../utils/validation/patientValidation');
const validation = require('../../utils/validateRequest');
const dbService = require('../../utils/dbService');
const models = require('../../model');
const utils = require('../../utils/common');

/**
 * @description : create record of Patient in SQL table.
 * @param {Object} req : request including body for creating record.
 * @param {Object} res : response of created record.
 * @return {Object} : created Patient. {status, message, data}
 */ 
const addPatient = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      patientSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    } 
    dataToCreate.addedBy = req.user.id;
    delete dataToCreate['updatedBy'];

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Patient,[ 'code' ],dataToCreate,'INSERT');
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let createdPatient = await dbService.createOne(Patient,dataToCreate);
    return  res.success({ data :createdPatient });
  } catch (error) {
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : create multiple records of Patient in SQL table.
 * @param {Object} req : request including body for creating records.
 * @param {Object} res : response of created records.
 * @return {Object} : created Patients. {status, message, data}
 */
const bulkInsertPatient = async (req, res)=>{
  try {
    let dataToCreate = req.body.data;   
    if (dataToCreate !== undefined && dataToCreate.length){
      dataToCreate = dataToCreate.map(item=>{
        delete item.updatedBy;
        item.addedBy = req.user.id;
              
        return item;
      });
      let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Patient,[ 'code' ],dataToCreate,'BULK_INSERT');
      if (checkUniqueFields.isDuplicate){
        return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
      }
      let createdPatient = await dbService.createMany(Patient,dataToCreate); 
      return  res.success({ data :{ count :createdPatient.length || 0 } });       
    }
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find all records of Patient from table based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, includes}, isCountOnly}
 * @param {Object} res : response contains data found from table.
 * @return {Object} : found Patient(s). {status, message, data}
 */
const findAllPatient = async (req, res) => {
  try {
    let dataToFind = req.body;
    let options = {};
    let query = {};
    let foundPatient;
    let validateRequest = validation.validateFilterWithJoi(
      dataToFind,
      patientSchemaKey.findFilterKeys,
      Patient.tableAttributes
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToFind && dataToFind.query !== undefined) {
      query = dataToFind.query;
    }
    if (dataToFind && dataToFind.isCountOnly){
      foundPatient = await dbService.count(Patient, query);
      if (!foundPatient) {
        return res.recordNotFound();
      } 
      foundPatient = { totalRecords: foundPatient };
      return res.success({ data :foundPatient });
    }
    if (dataToFind && dataToFind.options !== undefined) {
      options = dataToFind.options;
    }
    foundPatient = await dbService.paginate( Patient,query,options);
    if (!foundPatient){
      return res.recordNotFound();
    }
    return res.success({ data:foundPatient }); 
  }
  catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : find record of Patient from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains record retrieved from table.
 * @return {Object} : found Patient. {status, message, data}
 */
const getPatient = async (req, res) => {
  try { 
    let id = req.params.id;
    let foundPatient = await dbService.findOne(Patient,{ id :id });
    if (!foundPatient){
      return res.recordNotFound();
    }
    return  res.success({ data :foundPatient });

  } catch (error){
    return res.internalServerError();
  }
};

/**
 * @description : returns total number of records of Patient.
 * @param {Object} req : request including where object to apply filters in request body 
 * @param {Object} res : response that returns total number of records.
 * @return {Object} : number of records. {status, message, data}
 */
const getPatientCount = async (req, res) => {
  try {
    let dataToCount = req.body;
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      dataToCount,
      patientSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (dataToCount && dataToCount.where){
      where = dataToCount.where;
    }  
    let countedPatient = await dbService.count(Patient,where);
    if (!countedPatient){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :countedPatient } });

  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }
};

/**
 * @description : update record of Patient with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Patient.
 * @return {Object} : updated Patient. {status, message, data}
 */
const updatePatient = async (req, res) => {
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
      patientSchemaKey.schemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    query = { id:req.params.id };

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Patient,[ 'code' ],dataToUpdate,'UPDATE', query);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedPatient = await dbService.update(Patient,query,dataToUpdate);
    return  res.success({ data :updatedPatient }); 
  } catch (error){
    return res.internalServerError({ data:error.message }); 
  }    
};

/**
 * @description : update multiple records of Patient with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Patients.
 * @return {Object} : updated Patients. {status, message, data}
 */
const bulkUpdatePatient = async (req, res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = {
        ...req.body.data,
        updatedBy:req.user.id
      };
    }

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Patient,[ 'code' ],dataToUpdate,'BULK_UPDATE', filter);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedPatient = await dbService.update(Patient,filter,dataToUpdate);
    if (!updatedPatient){
      return res.recordNotFound();
    }
    return  res.success({ data :{ count :updatedPatient.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : partially update record of Patient with data by id;
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Patient.
 * @return {Object} : updated Patient. {status, message, data}
 */
const partialUpdatePatient = async (req, res) => {
  try {
    let dataToUpdate = { ...req.body, };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      patientSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { id:req.params.id };

    let checkUniqueFields = await utils.checkUniqueFieldsInDatabase(Patient,[ 'code' ],dataToUpdate,'UPDATE', query);
    if (checkUniqueFields.isDuplicate){
      return res.validationError({ message : `${checkUniqueFields.value} already exists.Only unique ${checkUniqueFields.field} are allowed.` });
    }

    let updatedPatient = await dbService.update(Patient, query, dataToUpdate);
    if (!updatedPatient) {
      return res.recordNotFound();
    }
    return res.success({ data : updatedPatient });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : deactivate record of Patient from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated record of Patient.
 * @return {Object} : deactivated Patient. {status, message, data}
 */
const softDeletePatient = async (req, res) => {
  try {
    query = { id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await dbService.update(Patient, query,updateBody);
    if (!result){
      return res.recordNotFound();
    }
    return  res.success({ data :result });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : delete record of Patient from table.
 * @param {Object} req : request including id as request param.
 * @param {Object} res : response contains deleted record.
 * @return {Object} : deleted Patient. {status, message, data}
 */
const deletePatient = async (req, res) => {
  const result = await dbService.deleteByPk(Patient, req.params.id);
  return  res.success({ data :result });
};

/**
 * @description : delete records of Patient in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of records deleted.
 * @return {Object} : no of records deleted. {status, message, data}
 */
const deleteManyPatient = async (req, res) => {
  try {
    let dataToDelete = req.body;
    if (!dataToDelete || !dataToDelete.ids) {
      return res.badRequest({ message : 'Insufficient request parameters! ids is required.' });
    }              
    let query = { id:{ $in:dataToDelete.ids } };
    let deletedPatient = await dbService.destroy(Patient,query);
    return res.success({ data :{ count :deletedPatient.length } });
  }
  catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

/**
 * @description : deactivate multiple records of Patient from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated records of Patient.
 * @return {Object} : number of deactivated documents of Patient. {status, message, data}
 */
const softDeleteManyPatient = async (req, res) => {
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
    let updatedPatient = await dbService.update(Patient,query,updateBody, options);
    if (!updatedPatient) {
      return res.recordNotFound();
    }
    return  res.success({ data :{ count: updatedPatient.length } });
  } catch (error){
    return res.internalServerError({ message:error.message });  
  }
};

module.exports = {
  addPatient,
  bulkInsertPatient,
  findAllPatient,
  getPatient,
  getPatientCount,
  updatePatient,
  bulkUpdatePatient,
  partialUpdatePatient,
  softDeletePatient,
  deletePatient,
  deleteManyPatient,
  softDeleteManyPatient,
};
