'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {

    // 1. Capteur
    await queryInterface.createTable('capteur', {
      IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      Description: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    });

    // 2. Humidite
    await queryInterface.createTable('humidite', {
      IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      pourcentage: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      dateMesure: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 3. Temperature
    await queryInterface.createTable('temperature', {
      IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      degres: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      dateMesure: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 4. Plante
    await queryInterface.createTable('plante', {
      IdPlante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 5. Serre
    await queryInterface.createTable('serre', {
      IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      }
    });

    // 6. Stock d'eau
    await queryInterface.createTable('stock_eau', {
      IdStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      IdSerre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'serre',
          key: 'IdSerre'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stockMax: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      stockActuel: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      stockage: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 7. Pompes
    await queryInterface.createTable('pompes', {
      IdPompe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      IdSerre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'serre',
          key: 'IdSerre'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stock_eau',
          key: 'IdStock'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 8. Renouvellement
    await queryInterface.createTable('renouvellement', {
      idAncienStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'stock_eau',
          key: 'IdStock'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idNouveauStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'stock_eau',
          key: 'IdStock'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ancienStock: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      nouveauStock: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    });

    // 9. Capteur - Humidite
    await queryInterface.createTable('capteurHumidite', {
      IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'capteur',
          key: 'IdCapteur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'humidite',
          key: 'IdHumidite'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 10. Capteur - Temperature
    await queryInterface.createTable('capteurTemperature', {
      IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'capteur',
          key: 'IdCapteur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'temperature',
          key: 'IdTemperature'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 11. Serre - Humidite
    await queryInterface.createTable('serre_humidite', {
      IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'serre',
          key: 'IdSerre'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'humidite',
          key: 'IdHumidite'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 12. Serre - Plante
    await queryInterface.createTable('serre_plante', {
      IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'serre',
          key: 'IdSerre'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdPlante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'plante',
          key: 'IdPlante'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 13. Serre - Temperature
    await queryInterface.createTable('serre_temperature', {
      IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'serre',
          key: 'IdSerre'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'temperature',
          key: 'IdTemperature'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface) {
    const tables = [
      'serre_temperature',
      'serre_plante',
      'serre_humidite',
      'capteurTemperature',
      'capteurHumidite',
      'renouvellement',
      'pompes',
      'stock_eau',
      'serre',
      'plante',
      'temperature',
      'humidite',
      'capteur'
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  }
};
