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
                    authorNameVisibility: false
                });
                this.getOwnerComponent().setModel(oModel, "viewModel");
                this.viewModel = this.getOwnerComponent().getModel("viewModel");
                this.i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            onAfterRendering: function () {
                this.getView().getModel().read("/Authors", {
                    success: $.proxy(function (oData) {
                        this.viewModel.setProperty("/authors", oData.results);
                    }, this)
                });
            },

            onCreateBook: function (oEvent) {
                if (this._oDialog) {
                    this._oDialog.destroy();
                    this._oDialog = undefined;
                }
                this.openDialog(oEvent);
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
                                    // success: function (oData, sResponse) {
                                    //     if (oData === undefined) {
                                    //         if (sResponse.statusCode === "204" && sResponse.body === "") {
                                    //             MessageToast.show(this.i18n.getText("succBookDelete"));
                                    //         }
                                    //     }
                                    // }.bind(this),
                                    // error: this.errorCallback.bind(this)
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
            onCreateAuthor: function () {
                this.viewModel.setProperty("/authorNameVisibility", true);
                //  var bVisible = false;

                //  sap.ui.core.Fragment.byId("CreateBookFragment","authorExtraCreateColumn").setVisible(true);

            },


            openDialog: function (oEvent, sExistinQPath) {
                this.getView().getModel().resetChanges(); //reset any OData changes
                this.viewModel.setProperty("/authorName", "");
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

            onAuthorIDLiveChange: function (oEvent) {
                let authorId = parseInt(oEvent.getParameter("value"));
                let authorExists = this.viewModel.getProperty("/authors").some(function (item) {
                    return item.ID = authorId;
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
                let authorName = this.viewModel.getProperty("/authorName");
                if (authorName) {
                    this.authorEvent = this.getView().getModel().createEntry("/Authors", {
                        properties: {
                            name: authorName,
                            ID: this.viewModel.getProperty("/authors").length + 1
                        }
                    });

                    oModel.setProperty(this.tempEvent.getPath() + "/author_ID", this.authorEvent.getProperty("ID"));
                }




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

            // successCallback: function () {
            //     MessageToast.show(this.i18n.getText("successfullyCreated"));
            // },

            setI18nResponseMsg: function (sSuccess, sError) {
                this.successI18nMsg = sSuccess;
                // this.errorI18nMsg = sError;
            },

            // deleteBook: function () {
            //     this.getView().getModel().remove("/Books('8')", {
            //         success: function () {
            //             MessageToast.show(this.i18n.getText("successfullyCreated"));
            //         },
            //         error: function (oError) {

            //         }
            //     });
            // }
            // successCallback: function (oData, sResponse) {
            //     var bIsError = false;
            //     if (oData !== undefined && Object.keys(oData).length !== 0) {
            //         oData.__batchResponses.forEach(function (oItem) {
            //             if (oItem.response !== undefined) {
            //                 if (oItem.response.statusCode === "400") {
            //                     bIsError = true;
            //                     var iStart = oItem.response.body.search("{\"lang\":\"en\",\"value\":\"");
            //                     var sError = oData.__batchResponses[0].response.body.substring(iStart + 22, oData.__batchResponses[0].response.body
            //                         .indexOf(
            //                             "."));
            //                     sap.m.MessageBox.error(sError);
            //                 }
            //             }
            //         });
            //     }
            //     if (!bIsError) {
            //         var sText = this.i18n.getText(this.successI18nMsg);
            //         sap.m.MessageToast.show(sText);
            //     }
            //     this.setI18nResponseMsg("", ""); // reset global Msg for next Response Text
            // },

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
                    properties: {}
                });

                this.BorrowBookDialog.bindElement({
                    path: this.borrowBookEvent.getPath()
                });
            },

            saveBorrowBook: function () {
                let oModel = this.getView().getModel();

                oModel.submitChanges({
                    success: $.proxy(function () {
                        MessageToast.show(this.i18n.getText("successfullyCreated"));
                        this.onCloseBorrowBookDialog();
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
