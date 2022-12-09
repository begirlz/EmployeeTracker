// import mysql2
const mysql = require('mysql2')
// import inquirer 
const inquirer = require('inquirer');
// import console.table
const cTable = require('console.table');

require('dotenv').config()

// setting up connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employee_db'
});

connection.connect(err => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    Initialize();
});

// landing page
Initialize = () => {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("*                                 *")
    console.log("***********************************")
    promptUser();
};

// inquirer prompts
const promptUser = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: ['View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Update an employee manager',
                "View employees by department",
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View department budgets',
                'No Action']
        }
    ])
        .then((answers) => {
            const { choices } = answers;

            if (choices === "View all departments") {
                showDepartments();
            }

            if (choices === "View all roles") {
                showRoles();
            }

            if (choices === "View all employees") {
                showEmployees();
            }

            if (choices === "Add a department") {
                addDepartment();
            }

            if (choices === "Add a role") {
                addRole();
            }

            if (choices === "Add an employee") {
                addEmployee();
            }

            if (choices === "Update an employee role") {
                updateEmployee();
            }

            if (choices === "Update an employee manager") {
                updateManager();
            }

            if (choices === "View employees by department") {
                employeeDepartment();
            }

            if (choices === "Delete a department") {
                deleteDepartment();
            }

            if (choices === "Delete a role") {
                deleteRole();
            }

            if (choices === "Delete an employee") {
                deleteEmployee();
            }

            if (choices === "View department budgets") {
                viewBudget();
            }

            if (choices === "No Action") {
                connection.end()
            };
        });
};

// function to execute query
exeQuery_View = (sql) => {
    connection.promise().query(sql)
        .then(([data, err]) => {
            console.table(data);
            promptUser();
        })
        .catch((err) => {
            throw err;
        })
};

// function to execute query with parameter with logging message
exeQuery_Param = (sql, parm, logMSG) => {
    connection.promise().query(sql, parm)
        .then(([data, err]) => {
            console.log(logMSG);
        })
        .catch((err) => {
            throw err;
        });
};

// function to show all departments 
showDepartments = () => {
    console.log('Showing all departments...\n');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;
    exeQuery_View(sql);
};

// function to show all roles 
showRoles = () => {
    console.log('Showing all roles...\n');

    const sql = `SELECT role.id, role.title, department.name AS department
               FROM role
               INNER JOIN department ON role.department_id = department.id`;
    exeQuery_View(sql);
};

// function to show all employees 
showEmployees = () => {
    console.log('Showing all employees...\n');
    const sql = `SELECT employee.id, 
                      employee.first_name, 
                      employee.last_name, 
                      role.title, 
                      department.name AS department,
                      role.salary, 
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    exeQuery_View(sql);
};

// function to add a department 
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDept',
            message: "What department do you want to add?",
            validate: addDept => {
                if (addDept) {
                    return true;
                } else {
                    console.log('Please enter a department');
                    return false;
                }
            }
        }
    ])
        .then(answer => {
            const sql = `INSERT INTO department (name)
                  VALUES (?)`;

            exeQuery_Param(sql, answer.addDept, 'Added ' + answer.addDept + ' to departments!');
            showDepartments();
        });
};

// function to add a role 
addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What role do you want to add?",
            validate: addRole => {
                if (addRole) {
                    return true;
                } else {
                    console.log('Please enter a role');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: "What is the salary of this role?",
            validate: addSalary => {
                if (isNaN(addSalary) === false) {
                    return true;
                } else {
                    console.log('Please enter a salary');
                    return false;
                }
            }
        }
    ])
        .then(answer => {
            const params = [answer.role, answer.salary];

            // grab dept from department table
            const roleSql = `SELECT name, id FROM department`;

            connection.promise().query(roleSql)
                .then(([data, err]) => {
                    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'dept',
                            message: "What department is this role in?",
                            choices: dept
                        }
                    ])
                        .then(deptChoice => {
                            const dept = deptChoice.dept;
                            params.push(dept);

                            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

                            exeQuery_Param(sql, params, 'Added' + answer.role + ' to roles!');
                            showRoles();

                        })
                        .catch(err => {
                            throw err;
                        })

                });
        });
};

// function to add an employee 
addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fistName',
            message: "What is the employee's first name?",
            validate: addFirst => {
                if (addFirst) {
                    return true;
                } else {
                    console.log('Please enter a first name');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLast => {
                if (addLast) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        }
    ])
        .then(answer => {
            const params = [answer.fistName, answer.lastName]

            // grab roles from roles table
            const roleSql = `SELECT role.id, role.title FROM role`;

            connection.promise().query(roleSql)
                .then(([data, err]) => {
                    const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's role?",
                            choices: roles
                        }
                    ])
                        .then(roleChoice => {
                            const role = roleChoice.role;
                            params.push(role);

                            const managerSql = `SELECT * FROM employee`;

                            connection.promise().query(managerSql)
                                .then(([data, err]) => {
                                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

                                    inquirer.prompt([
                                        {
                                            type: 'list',
                                            name: 'manager',
                                            message: "Who is the employee's manager?",
                                            choices: managers
                                        }
                                    ])
                                        .then(managerChoice => {
                                            const manager = managerChoice.manager;
                                            params.push(manager);

                                            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`;

                                            exeQuery_Param(sql, params, "Employee has been added!!");
                                            showEmployees();

                                        });
                                })
                                .catch((err) => {
                                    throw err;
                                });

                        });
                })
                .catch(err => {
                    throw err;
                })
        });
};

// function to update an employee 
updateEmployee = () => {
    // get employees from employee table 
    const employeeSql = `SELECT * FROM employee`;

    connection.promise().query(employeeSql)
        .then(([data, err]) => {
            const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee would you like to update?",
                    choices: employees
                }
            ])
                .then(empChoice => {
                    const employee = empChoice.name;
                    const params = [];
                    params.push(employee);

                    const roleSql = `SELECT * FROM role`;

                    connection.promise().query(roleSql, params)
                        .then(([data, err]) => {
                            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'role',
                                    message: "What is the employee's new role?",
                                    choices: roles
                                }
                            ])
                                .then(roleChoice => {
                                    const role = roleChoice.role;
                                    params.push(role);

                                    let employee = params[0]
                                    params[0] = role
                                    params[1] = employee

                                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                                    exeQuery_Param(sql, params, "Employee has been updated!");
                                    showEmployees();

                                });
                        })
                        .catch((err) => {
                            throw err;
                        });
                })
                .catch((err) => {
                    throw err;
                });
        });
}

// function to update an employee 
updateManager = () => {
    // get employees from employee table 
    const employeeSql = `SELECT * FROM employee`;

    connection.promise().query(employeeSql)
        .then(([data, err]) => {
            const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'name',
                    message: "Which employee would you like to update?",
                    choices: employees
                }
            ])
                .then(empChoice => {
                    const employee = empChoice.name;
                    const params = [];
                    params.push(employee);

                    const managerSql = `SELECT * FROM employee`;

                    connection.promise().query(managerSql, params)
                        .then(([data, err]) => {
                            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: "Who is the employee's manager?",
                                    choices: managers
                                }
                            ])
                                .then(managerChoice => {
                                    const manager = managerChoice.manager;
                                    params.push(manager);

                                    let employee = params[0]
                                    params[0] = manager
                                    params[1] = employee

                                    const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

                                    exeQuery_Param(sql, params, "Employee has been updated!");
                                    showEmployees();
                                });
                        })
                        .catch((err) => {
                            throw err;
                        });

                });
        })
        .catch((err) => {
            throw err;
        });
};

// function to view employee by department
employeeDepartment = () => {
    console.log('Showing employee by departments...\n');
    const sql = `SELECT employee.first_name, 
                      employee.last_name, 
                      department.name AS department
               FROM employee 
               LEFT JOIN role ON employee.role_id = role.id 
               LEFT JOIN department ON role.department_id = department.id`;

    exeQuery_View(sql);
};

// function to delete department
deleteDepartment = () => {
    const deptSql = `SELECT * FROM department`;

    connection.promise().query(deptSql)
        .then(([data, err]) => {
            const dept = data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: "What department do you want to delete?",
                    choices: dept
                }
            ])
                .then(deptChoice => {
                    const dept = deptChoice.dept;
                    const sql = `DELETE FROM department WHERE id = ?`;

                    exeQuery_Param(sql, dept, 'Successfully Deleted!');
                    showDepartments();
                });
        })
        .catch((err) => {
            throw err;
        });
};

// function to delete role
deleteRole = () => {
    const roleSql = `SELECT * FROM role`;

    connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const role = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: "What role do you want to delete?",
                choices: role
            }
        ])
            .then(roleChoice => {
                const role = roleChoice.role;
                const sql = `DELETE FROM role WHERE id = ?`;

                exeQuery_Param(sql, role, "Successfully Deleted!");
                showRoles();

            });
    });
};

// function to delete employees
deleteEmployee = () => {
    // get employees from employee table 
    const employeeSql = `SELECT * FROM employee`;

    connection.promise().query(employeeSql)
            .then(([data,fields]) => {
                const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'name',
                        message: "Which employee would you like to delete?",
                        choices: employees
                    }
                ])
                    .then(empChoice => {
                        const employee = empChoice.name;
        
                        const sql = `DELETE FROM employee WHERE id = ?`;
        
                        exeQuery_Param(sql, employee, "Successfully Deleted!");
                        showEmployees();
                    });
            })
            .catch((err) => {
                throw err;
            }); 
};

// view department budget 
viewBudget = () => {
    console.log('Showing budget by department...\n');

    const sql = `SELECT department_id AS id, 
                      department.name AS department,
                      SUM(salary) AS budget
               FROM  role  
               JOIN department ON role.department_id = department.id GROUP BY  department_id`;
    exeQuery_View(sql);
};
