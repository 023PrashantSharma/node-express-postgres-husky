/**
 * ToDo.js
 * @description :: sequelize model of database table ToDo
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let ToDo = sequelize.define('ToDo',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  name:{ type:DataTypes.STRING },
  description:{ type:DataTypes.STRING },
  date:{ type:DataTypes.DATE },
  dueDate:{ type:DataTypes.DATE },
  isCompleted:{ type:DataTypes.BOOLEAN },
  isActive:{ type:DataTypes.BOOLEAN },
  createdAt:{ type:DataTypes.DATE },
  updatedAt:{ type:DataTypes.DATE },
  addedBy:{ type:DataTypes.INTEGER },
  updatedBy:{ type:DataTypes.INTEGER },
  isDeleted:{ type:DataTypes.BOOLEAN }
}
,{
  hooks:{
    beforeCreate: [
      async function (ToDo,options){
        ToDo.isActive = true;
        ToDo.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (ToDo,options){
        if (ToDo !== undefined && ToDo.length) { 
          for (let index = 0; index < ToDo.length; index++) { 
        
            const element = ToDo[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
  ,indexes:  [{
    'using':'BTREE',
    'fields':[{
      'attribute':'date',
      'order':'DESC',
      'operator':'',
      'value':''
    }],
    'name':'ToDo_index_date_index_1'
  },{
    'using':'BTREE',
    'fields':[{
      'attribute':'dueDate',
      'order':'DESC',
      'operator':'',
      'value':''
    }],
    'name':'ToDo_index_dueDate_index_2'
  }]
}
);
ToDo.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.date = dayjs(values.date).format('MMM D, YYYY h A');
  values.dueDate = dayjs(values.dueDate).format('MMM D, YYYY h A');
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(ToDo);
sequelizePaginate.paginate(ToDo);
module.exports = ToDo;
