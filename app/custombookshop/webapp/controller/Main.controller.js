// eslint-disable-next-line no-undef
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, MessageBox, JSONModel) {
        "use strict";

        return Controller.extend("custombookshop.controller.Main", {
            onInit: function () {
                var oModel = new JSONModel({
                    // authorNameVisibility: false,
                    // categoryNameVisibility: false
                });
                this.getOwnerComponent().setModel(oModel, "viewModel");
                this.viewModel = this.getOwnerComponent().getModel("viewModel");
                this.i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                // this.byId("smartChartBooks").rebindChart();
            },

            onAfterRendering: function () {
                this.getView().getModel().read("/Authors", {
                    success: $.proxy(function (oData) {
                        this.viewModel.setProperty("/authors", oData.results);
                    }, this)
                });
                this.getView().getModel().read("/Categories", {
                    success: $.proxy(function (oData) {
                        this.viewModel.setProperty("/categories", oData.results);
                    }, this)
                });
            },

            onScanSuccess: function (oEvent) {
                var scannedValue = oEvent.getParameter("text");
                var filterBar = this.byId("smartFilterBar");

                filterBar.setFilterData({
                    isbn: scannedValue
                });

                filterBar.getControlByKey("isbn").setValue(scannedValue);

                filterBar.search();
            },

            onCreateBook: function (oEvent) {
                if (this._oDialog) {
                    this._oDialog.destroy();
                    this._oDialog = undefined;
                }
                this.openDialog(oEvent);
            },

            onPressIsbn: function (oEvent) {
                let oSelectedItem = oEvent.getSource().getBindingContext().getObject();
                let bookURL = "https://isbndb.com/book/" + oSelectedItem.isbn;
                window.open(bookURL, "_blank");

            },

            onEditBook: function (oEvent) {
                this.openDialog(oEvent, oEvent.getSource().getBindingContext().getPath());
            },

            onDeleteBook: function (oEvent) {
                var context = oEvent.getSource().getBindingContext();
                this.sPathToDelete = this.getView().getModel().createKey("/Books", {
                    ID: context.getProperty("ID")
                });
                if (!this._oBookDeleteDialog) {
                    this._oBookDeleteDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: this.i18n.getText("confirm"),
                        content: new sap.m.Text({
                            text: this.i18n.getText("areUSureBookDelete")
                        }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: this.i18n.getText("delete"),
                            press: function () {
                                this.getView().getModel().remove(this.sPathToDelete, {
                                    success: $.proxy(function (oData, sResponse) {
                                        MessageToast.show(this.i18n.getText("succBookDelete"));
                                    }, this)
                                   
                                });
                                this._oBookDeleteDialog.close();
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: this.i18n.getText("cancel"),
                            press: function () {
                                this._oBookDeleteDialog.close();
                            }.bind(this)
                        })
                    });
                    this._oBookDeleteDialog.open();
                } else {
                    this._oBookDeleteDialog.open();
                }
            },
            // onCreateAuthor: function () {
            //     this.viewModel.setProperty("/authorNameVisibility", true);
            // },

            onCreateCategory: function () {
                // this.viewModel.setProperty("/categoryNameVisibility", true);
            },


            openDialog: function (oEvent, sExistinQPath) {
                this.getView().getModel().resetChanges(); //reset any OData changes
                // this.viewModel.setProperty("/authorName", "");
                if (!this.CreateBookDialog) {
                    Fragment.load({
                        id: "CreateBookDialog",
                        name: "custombookshop.view.fragments.CreateBook",
                        controller: this
                    }).then(function (oDialog) { //Init of Dialog - this won't be run again, the dialog will just open
                        this.CreateBookDialog = oDialog;
                        this.getView().addDependent(this.CreateBookDialog);
                        if (sExistinQPath !== undefined) {
                            this.bIsCreateNew = false;
                            this.bindExistingBook(sExistinQPath);
                        } else {
                            this.bIsCreateNew = true;
                            this.bindNewBook();
                        }
                        this.setDialogTitle(sExistinQPath);
                        this.CreateBookDialog.open();
                    }.bind(this));
                } else {
                    if (sExistinQPath !== undefined) {
                        this.bIsCreateNew = false;
                        this.bindExistingBook(sExistinQPath);
                    } else {
                        this.bIsCreateNew = true;
                        this.bindNewBook();
                    }
                    this.setDialogTitle(sExistinQPath);
                    this.CreateBookDialog.open();
                }
            },

            bindExistingBook: function (sPath) {
                this.CreateBookDialog.bindElement({
                    path: sPath
                });              
            },

            bindNewBook: function () {     
                this.tempEvent = this.getView().getModel().createEntry("Books", {
                    properties: {}
                });
                this.CreateBookDialog.bindElement({
                    path: this.tempEvent.getPath()
                });
            },

            setDialogTitle: function (sExistingQPath) {
                if (this.CreateBookDialog) {
                    if (sExistingQPath !== undefined) {
                        this.CreateBookDialog.setTitle(this.i18n.getText("changeBook"));
                    } else { // new
                        this.CreateBookDialog.setTitle(this.i18n.getText("maintainBook"));
                    }
                }
            },


            onCloseCreateBookDialog: function () {
                this.CreateBookDialog.close();
                this.tempEvent = null;
                this.CreateBookDialog.unbindElement();
            },

            saveBook: function () {
                let oModel = this.getView().getModel();

                if (this.bIsCreateNew) {
                    this.setI18nResponseMsg("successfullyCreated", "");
                } else {
                    this.setI18nResponseMsg("successfullyUpdated", "");
                }
                oModel.submitChanges({
                    success: $.proxy(function () {
                        MessageToast.show(this.i18n.getText(this.successI18nMsg));
                    }, this),

                    error: function (oError) {
                        var sError = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(sError);
                    }

                });
                this.CreateBookDialog.close();
                // }
            },

            setI18nResponseMsg: function (sSuccess, sError) {
                this.successI18nMsg = sSuccess;
            },

            onCreateAuthor : function () {
                if (!this.AuthorDialog) {
                    Fragment.load({
                        id: "AuthorDialog",
                        name: "custombookshop.view.fragments.Author",
                        controller: this
                    }).then(function (oDialog) {
                        this.AuthorDialog = oDialog;
                        this.getView().addDependent(this.AuthorDialog);
                        this.bindNewAuthor();
                        this.AuthorDialog.open();
                    }.bind(this));
                } else {
                    this.bindNewAuthor();
                    this.AuthorDialog.open();
                }
            },

            bindNewAuthor : function () {
                this.getView().getModel().resetChanges(); //reset any OData changes
                this.authorEvent = this.getView().getModel().createEntry("Authors", {
                    properties: {
                       
                    }
                });

                this.AuthorDialog.bindElement({
                    path: this.authorEvent.getPath()
                });
            },

            saveAuthor : function () {
                let oModel = this.getView().getModel();
                oModel.submitChanges({
                    success: $.proxy(function () {
                        MessageToast.show(this.i18n.getText("successfullyCreated"));
                        // this.getView().byId("idTblBookData").rebindTable();
                        this.onCloseCreateAuthorDialog();
                       
                    }, this),

                    error: function (oError) {
                        var sError = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(sError);
                    }

                });
            },

            onCloseCreateAuthorDialog : function () {
                this.AuthorDialog.close();
                this.authorEvent = null;
                this.AuthorDialog.unbindElement();
            },

            onCreateCategory : function () {
                if (!this.CategoryDialog) {
                    Fragment.load({
                        id: "CategoryDialog",
                        name: "custombookshop.view.fragments.Category",
                        controller: this
                    }).then(function (oDialog) {
                        this.CategoryDialog = oDialog;
                        this.getView().addDependent(this.CategoryDialog);
                        this.bindNewCategory();
                        this.CategoryDialog.open();
                    }.bind(this));
                } else {
                    this.bindNewCategory();
                    this.CategoryDialog.open();
                }
            },

            bindNewCategory : function () {
                this.getView().getModel().resetChanges(); //reset any OData changes
                this.categoryEvent = this.getView().getModel().createEntry("Categories", {
                    properties: {
                       
                    }
                });

                this.CategoryDialog.bindElement({
                    path: this.categoryEvent.getPath()
                });
            },

            saveCategory: function () {
                let oModel = this.getView().getModel();
                oModel.submitChanges({
                    success: $.proxy(function () {
                        MessageToast.show(this.i18n.getText("successfullyCreated"));
                        // this.getView().byId("idTblBookData").rebindTable();
                        this.onCloseCreateCategoryDialog();
                       
                    }, this),

                    error: function (oError) {
                        var sError = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(sError);
                    }

                });
            },

            onCloseCreateCategoryDialog : function () {
                this.CategoryDialog.close();
                this.categoryEvent = null;
                this.CategoryDialog.unbindElement();
            },


            onBorrowBook: function () {
                if (!this.BorrowBookDialog) {
                    Fragment.load({
                        id: "BorrowBookDialog",
                        name: "custombookshop.view.fragments.BorrowBook",
                        controller: this
                    }).then(function (oDialog) {
                        this.BorrowBookDialog = oDialog;
                        this.getView().addDependent(this.BorrowBookDialog);
                        this.bindNewBorrowBook();
                        this.BorrowBookDialog.open();
                    }.bind(this));
                } else {
                    this.bindNewBorrowBook();
                    this.BorrowBookDialog.open();
                }

            },

            bindNewBorrowBook: function () {
                this.getView().getModel().resetChanges(); //reset any OData changes
                this.borrowBookEvent = this.getView().getModel().createEntry("Reportings", {
                    properties: {
                        borrowedDate: new Date(),
                        bookName: ""
                    }
                });

                this.BorrowBookDialog.bindElement({
                    path: this.borrowBookEvent.getPath()
                });
            },

            onScanBorrowBookSuccess: function (oEvent) {
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled", {
                        duration: 1000
                    });
                } else {
                    if (oEvent.getParameter("text")) {
                        this.getView().getModel().setProperty(this.borrowBookEvent.getPath() + "/book_ID", oEvent.getParameter("text"));
                    } else {
                        MessageToast.show("");
                    }
                }
            },

            onScanBorrowBookError: function (oEvent) {
                MessageToast.show("Scan failed: " + oEvent, {
                    duration: 1000
                });
            },

            saveBorrowBook: function () {
                let oModel = this.getView().getModel();

                let id = this.borrowBookEvent.getProperty("book_ID");
                let book = oModel.getProperty("/Books(" + id + ")");
                this.getView().getModel().setProperty(this.borrowBookEvent.getPath() + "/bookName", book.title);
                if (book.availability === "N") {
                    MessageBox.warning(this.i18n.getText("borrowedBookWarning"));
                    return 1;
                }

                oModel.submitChanges({
                    success: $.proxy(function () {
                        MessageToast.show(this.i18n.getText("successfullyCreated"));
                        this.getView().byId("idTblBookData").rebindTable();
                        this.onCloseBorrowBookDialog();
                        this.byId("smartChartBooks").rebindChart();
                        this.byId("smartChartAuthors").rebindChart();
                    }, this),

                    error: function (oError) {
                        var sError = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(sError);
                    }

                });
            },
            onCloseBorrowBookDialog: function () {
                this.BorrowBookDialog.close();
                this.borrowBookEvent = null;
                this.BorrowBookDialog.unbindElement();
            }
        });
    });
