var MWS260_B_UPDATE_DCONSI = (function () {
    function MWS260_B_UPDATE_DCONSI(scriptArgs) {
        this.enableSearch = false;
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        var isScernario2 = "false";
    }
    MWS260_B_UPDATE_DCONSI.Init = function (args) {
        new MWS260_B_UPDATE_DCONSI(args).run();
    };
    MWS260_B_UPDATE_DCONSI.prototype.run = function () {
        console.log("--------------------------........................in run");

        // check drs100mi

        var _this = this;
        this.lastRowUpdated = 0;
        var list = this.controller.GetGrid();
        var customColumnNum = list.getColumns().length + 1;
        this.clearRecord();
       this.checkAddress();
       this.attachEvents(this.controller);


    };
    MWS260_B_UPDATE_DCONSI.prototype.clearRecord = function () {
        console.log("--------------------------........................clear reocds");
        var frDRS = ScriptUtil.GetFieldValue("WWCONN");
        var frMWS = ScriptUtil.GetFieldValue("WWDLIX");

        if (frDRS != "") {
            var myRequest = new MIRequest();
            myRequest.program = "CUSEXTMI";
            myRequest.transaction = "ChgAlphaKPI";
            // output
            myRequest.outputFields = [""];
            // input
            myRequest.record = {
                KPID: "DCONSI",
                PK01: frDRS,              
                AL30: "",
                AL31: "",
                AL32: "",
                AL33: ""

            };
            MIService.Current.executeRequest(myRequest).then(function (response) {
                // record UPDATE 
                console.log("--------------------------.......................RECORD CLEAR ");
            })["catch"](function (response) {
                console.log("IN  API ERROR----51------..." + response.errorMessage);
                this.detachEvents();
            });
        }
        if (frMWS != "") {
            var myRequest = new MIRequest();
            myRequest.program = "CUSEXTMI";
            myRequest.transaction = "ChgAlphaKPI";
            // output
            myRequest.outputFields = [""];
            // input
            myRequest.record = {
                KPID: "MHDISH",
                PK01: "1",
                PK02: frMWS,
                AL30: "",
                AL31: "",
                AL32: "",
                AL33: ""

            };
            MIService.Current.executeRequest(myRequest).then(function (response) {
                // record UPDATE 

                console.log("--------------------------.......................RECORD CLEAR ");
            })["catch"](function (response) {
                console.log("IN  API ERROR-----77------..." + response.errorMessage);
                this.detachEvents();
            });
        }
    }
    MWS260_B_UPDATE_DCONSI.prototype.checkAddress = function () {
    
        
        this.scenario1();

    };


    MWS260_B_UPDATE_DCONSI.prototype.scenario1 = function (args) {
        var frDRS = ScriptUtil.GetFieldValue("WWCONN");
        var frMWS = ScriptUtil.GetFieldValue("WWDLIX");
        if (frDRS != "") {

            console.log("--------------------------2A........................frDRS " + frDRS);
            // get connected Deliveries
            var items;
            // Init API Call
            var myRequest = new MIRequest();
            myRequest.program = "DRS100MI";
            myRequest.transaction = "GetShipment";
            // output
            myRequest.outputFields = ["FWNO"];
            // input
            myRequest.record = {
                CONN: frDRS
            };
            // Calling API
            MIService.Current.executeRequest(myRequest).then(function (response) {
                // Read results here
                var fwno = response.items[0].FWNO;
                console.log("--------------------------........................fwno " + fwno);
                // get address
                var myRequest = new MIRequest();
                myRequest.program = "CRS620MI";
                myRequest.transaction = "GetBasicData";
                // output
                myRequest.outputFields = ["SFI5"];
                // input
                myRequest.record = {
                    SUNO: fwno,

                };
                MIService.Current.executeRequest(myRequest).then(function (response) {
                    //CHEKC SFI5
                    var sfi5 = response.items[0].SFI5;
                    console.log("......sfi5 " + sfi5);
                    if (sfi5 === "") {
                        console.log(".......SFI5 IS EMPTY GOING TO SCENARIO 2 FROMDRS ");
                        console.log(".......0 ");
                        //scenario 2 from drs
                        if (frDRS != "") {
                            console.log(" SHIPMENT--scenario 2--------..." + frDRS);
                            //SHIPMENT scenario 2
                            var items;
                            // Init API Call
                            var myRequest = new MIRequest();
                            myRequest.program = "DRS100MI";
                            myRequest.transaction = "LstByDelivery";
                            // output
                            myRequest.outputFields = ["DLIX"];
                            // input
                            myRequest.record = {
                                CONN: frDRS
                            };
                            // Calling API
                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                var delNo = response.items[0].DLIX;
                                // Calling API
                                var myRequest = new MIRequest();
                                myRequest.program = "MWS410MI";
                                myRequest.transaction = "GetHead";
                                // output
                                myRequest.outputFields = ["CONA", "TEDF"];
                                // input
                                myRequest.record = {
                                    DLIX: delNo,
                                };
                                MIService.Current.executeRequest(myRequest).then(function (response) {

                                    var tedf = response.items[0].TEDF;
                                    var cona = response.items[0].CONA;

                                    console.log("--------------------------.......................cona " + cona);
                                    // GET 3RDPARTYY ADDRESS
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CRS610MI";
                                    myRequest.transaction = "GetAddress";
                                    // output
                                    // myRequest.outputFields = ["SFI5"];
                                    //myRequest.outputFields = [ "CUNO", "CUNM", "CUA1", "CUA2", "CUA3"];
                                    myRequest.outputFields = ["ADID", "SUNO", "ADTE", "STDT", "SUNM", "ADR1", "ADR2", "ADR3"];
                                    // input
                                    myRequest.record = {
                                        CUNO: cona,
                                        ADRT: "4",
                                        ADID: "3PBILL",

                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {
                                        var cunm = response.items[0].CUNM
                                                var adr1 = response.items[0].CUA1
                                                var adr2 = response.items[0].CUA2
                                                var adr3 = response.items[0].CUA3
                                                console.log("--------------------------.......................frDRS " + frDRS);
                                                console.log("--------------------------.......................cunm " + cunm);
                                                console.log("--------------------------.......................adr1 " + adr1);
                                                console.log("--------------------------.......................adr2 " + adr2);
                                                console.log("--------------------------.......................adr3 " + adr3);
                                        // get dely terms
                                        var myRequest = new MIRequest();
                                        myRequest.program = "CRS065MI";
                                        myRequest.transaction = "GetDelyTerm";
                                        // output
                                        myRequest.outputFields = ["RCPY"];
                                        // input
                                        console.log("--------------------------........................tedf " + tedf);
                                        myRequest.record = {
                                            TEDL: tedf,
                                            LNCD: "GB",

                                        };
                                        MIService.Current.executeRequest(myRequest).then(function (response) {                       //  
                                            var rcpy = response.items[0].RCPY;
                                            console.log("--------------------------.......................rcpy " + rcpy);
                                            if ((rcpy === "1") || (rcpy === "3")) {
                                                

                                                //call api to save
                                                //UPDATE CUGEX3 RECORD
                                                var myRequest = new MIRequest();
                                                myRequest.program = "CUSEXTMI";
                                                myRequest.transaction = "ChgAlphaKPI";
                                                // output
                                                myRequest.outputFields = [""];
                                                // input
                                                myRequest.record = {
                                                    KPID: "DCONSI",
                                                    PK01: frDRS,                                                    
                                                    AL30: cunm,
                                                    AL31: adr1,
                                                    AL32: adr2,
                                                    AL33: adr3

                                                };
                                               
                                                MIService.Current.executeRequest(myRequest).then(function (response) {
                                                    // record UPDATE 

                                                    console.log("--------------------------....................322....rec UPDATED "+frDRS);
                                                })["catch"](function (response) {
                                                    console.log("IN  API ERROR-----1--325----..." + response.errorMessage);
                                                    this.detachEvents();
                                                });
                                            }

                                        })["catch"](function (response) {
                                            console.log("IN MWS410MI API ERROR---2----276----..." + response.errorMessage);
                                            this.detachEvents();
                                        });



                                    })["catch"](function (response) {
                                        console.log("IN MWS410MI API ERROR-283---3-------..." + response.errorMessage);
                                        this.detachEvents();
                                    });



                                })["catch"](function (response) {
                                    console.log(" API ERROR-----345------..." + response.errorMessage);
                                    this.detachEvents();
                                });
                            })["catch"](function (response) {
                                console.log("IN  API ERROR----6---349----..." + response.errorMessage);
                                // Handle errors here
                                this.detachEvents();
                                // console.log.Info(response.errorMessage);
                            });

                        } else {
                            console.log(" else----------..." + frDRS);
                        }
                    } else {
                        console.log(".......SFI5 IS not EMPTY GOINGCONTINUE WIITH LOGIC " + sfi5);
                        var items;
                        // Init API Call
                        //STEP 5 SHIPMENT
                        var myRequest = new MIRequest();
                        myRequest.program = "DRS100MI";
                        myRequest.transaction = "LstByDelivery";
                        // output
                        myRequest.outputFields = ["DLIX", "TEDF"];
                        // input
                        myRequest.record = {
                            CONN: frDRS
                        };
                        // Calling API
                        MIService.Current.executeRequest(myRequest).then(function (response) {
                            // Read results here
                            var delNo = response.items[0].DLIX;


                            var myRequest = new MIRequest();
                            myRequest.program = "MWS410MI";
                            myRequest.transaction = "GetHead";
                            // output
                            myRequest.outputFields = ["TEDF", "FWNO"];
                            // input
                            myRequest.record = {
                                DLIX: delNo,
                                ADRT: "02"
                            };
                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                var tedf = response.items[0].TEDF;
                                var fwno = response.items[0].FWNO;

                                console.log("--------------------------........................tedf " + tedf);
                                console.log("--------------------------........................fwno " + fwno);
                                if (fwno != "") {
                                    //continue                                        
                                    // get address
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CRS620MI";
                                    myRequest.transaction = "GetBasicData";
                                    // output
                                    myRequest.outputFields = ["SFI5"];
                                    // input
                                    myRequest.record = {
                                        SUNO: fwno,
                                        //ADRT: "02"
                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {
                                        var sfi5 = response.items[0].SFI5;

                                        if (sfi5 === "T") {
                                            console.log(".....114..SFI5 IS not EMPTY GOING CONTINUE WIITH LOGIC 255" + sfi5);

                                            //GET TERMS
                                            var myRequest = new MIRequest();
                                            myRequest.program = "CRS065MI";
                                            myRequest.transaction = "GetDelyTerm";
                                            // output
                                            myRequest.outputFields = ["RCPY", "TEDL"];
                                            // input
                                            myRequest.record = {
                                                TEDL: tedf,
                                                LNCD: "GB"

                                            };
                                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                                var rcpy = response.items[0].RCPY;

                                                if ((rcpy === "0") || (rcpy === "2")) {
                                                    // 8 
                                                    console.log("--------------------------......272..................rcpyIsEven " + rcpy);
                                                    var myRequest = new MIRequest();
                                                    myRequest.program = "CRS620MI";
                                                    myRequest.transaction = "LstAddresses";
                                                    // output
                                                    myRequest.outputFields = ["ADID", "SUNO", "ADTE", "STDT", "SUNM", "ADR1", "ADR2", "ADR3"];
                                                    // input
                                                    myRequest.record = {
                                                        SUNO: fwno,

                                                    };
                                                    MIService.Current.executeRequest(myRequest).then(function (response) {
                                                        console.log("--------------------------......IN api CALL..................rcpy ");
                                                        // record UPDATE 
                                                        for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
                                                            // Get individual LINES
                                                            var item = _a[_i];
                                                            var adid = item.ADID;
                                                            //CHK FOR 3PBILL		
                                                            if (adid === "3PBILL") {
                                                                var suno = item.SUNO;
                                                                var adte = item.ADTE;
                                                                var stdt = item.STDT;

                                                                var sunm = item.SUNM;
                                                                var adr1 = item.ADR1;
                                                                var adr2 = item.ADR2;
                                                                var adr3 = item.ADR3;
                                                                console.log("--------------------------.......................cunm " + sunm);
                                                                console.log("--------------------------.......................adr1 " + adr1);
                                                                console.log("--------------------------.......................adr2 " + adr2);
                                                                console.log("--------------------------.......................adr3 " + adr3);
                                                                //UPDATE CUGEX3 RECORD
                                                                var myRequest = new MIRequest();
                                                                myRequest.program = "CUSEXTMI";
                                                                myRequest.transaction = "ChgAlphaKPI";
                                                                // output
                                                                myRequest.outputFields = [""];
                                                                // input
                                                                myRequest.record = {
                                                                    KPID: "DCONSI",
                                                                    PK01: frDRS,
                                                                    AL30: sunm,
                                                                    AL31: adr1,
                                                                    AL32: adr2,
                                                                    AL33: adr3

                                                                };
                                                                MIService.Current.executeRequest(myRequest).then(function (response) {
                                                                    // record UPDATE 

                                                                    console.log("--------------------------........................recUPDATED ");
                                                                })["catch"](function (response) {
                                                                    console.log("IN MWS410MI API ERROR-------428----..." + response.errorMessage);
                                                                    this.detachEvents();
                                                                });
                                                            } else {
                                                                console.log("--------------------------........................adid " + adid);
                                                            }
                                                        }
                                                    })["catch"](function (response) {
                                                        console.log("IN MWS410MI API ERROR-----436------..." + response.errorMessage);
                                                        this.detachEvents();
                                                    });
                                                } else {
                                                    console.log("--------------------------. //SCENARIO 2 SHIPMENT..RCPY IS ODD.......EXIT SCRIPT " + rcpy);
                                                }

                                            })["catch"](function (response) {
                                                console.log("IN CRS065 API ERROR----344-------..." + response.errorMessage);
                                                this.detachEvents();
                                            });
                                        }

                                    })["catch"](function (response) {
                                        console.log("IN  API ERROR--4-----534----..." + response.errorMessage);
                                        // Handle errors here
                                        this.detachEvents();
                                        // console.log.Info(response.errorMessage);
                                    });
                                } else {
                                    //SCENAIO2 FROMMWS
                                    console.log("FWNO IS BLANK -MOVE TO SCENAIO2 FROMMWS--354-------...");
                                }
                            })["catch"](function (response) {
                                console.log("IN MWS410MI API ERROR---460--------..." + response.errorMessage);
                                this.detachEvents();
                            });


                        })["catch"](function (response) {
                            console.log("IN  API ERROR----6-----550--..." + response.errorMessage);
                            // Handle errors here
                            this.detachEvents();
                            // console.log.Info(response.errorMessage);
                        });
                    }


                })["catch"](function (response) {
                    console.log("IN  API ERROR--9-----559----..." + response.errorMessage);
                    // Handle errors here
                    // this.detachEvents();
                    // console.log.Info(response.errorMessage);
                });
            })
        }

        if (frMWS != "") {
            console.log("--------------------------...............2B.........frMWS " + frMWS);
            // get address
            var myRequest = new MIRequest();
            myRequest.program = "MWS410MI";
            myRequest.transaction = "GetHead";
            // output
            myRequest.outputFields = ["TEDF", "FWNO"];
            // input
            myRequest.record = {
                DLIX: frMWS,
                ADRT: "02"
            };
            MIService.Current.executeRequest(myRequest).then(function (response) {
                var tedf = response.items[0].TEDF;
                var fwno = response.items[0].FWNO;

                console.log("--------------------------........................tedf " + tedf);
                console.log("--------------------------........................fwno " + fwno);
                if (fwno != "") {
                    //continue                                        
                    // get address
                    var myRequest = new MIRequest();
                    myRequest.program = "CRS620MI";
                    myRequest.transaction = "GetBasicData";
                    // output
                    myRequest.outputFields = ["SFI5"];
                    // input
                    myRequest.record = {
                        SUNO: fwno,
                        //ADRT: "02"
                    };
                    MIService.Current.executeRequest(myRequest).then(function (response) {
                        var sfi5 = response.items[0].SFI5;

                        if (sfi5 === "T") {
                            console.log(".....442..SFI5 IS not EMPTY GOING CONTINUE WIITH LOGIC " + sfi5);

                            //GET TERMS
                            var myRequest = new MIRequest();
                            myRequest.program = "CRS065MI";
                            myRequest.transaction = "GetDelyTerm";
                            // output
                            myRequest.outputFields = ["RCPY"];
                            // input
                            myRequest.record = {
                                TEDL: tedf,
                                LNCD: "GB"

                            };
                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                var rcpy = response.items[0].RCPY;

                                console.log("--------------------------..........443..............rcpy " + rcpy);
                                if ((rcpy === "0") || (rcpy === "2")) {
                                    console.log("--------------------------......272..................rcpyIsEven " + rcpy);
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CRS620MI";
                                    myRequest.transaction = "LstAddresses";
                                    // output
                                    myRequest.outputFields = ["ADID", "SUNO", "ADTE", "STDT", "SUNM", "ADR1", "ADR2", "ADR3"];
                                    // input
                                    myRequest.record = {
                                        SUNO: fwno,

                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {
                                        console.log("--------------------------......IN api CALL..................rcpy ");
                                        // record UPDATE 
                                        for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
                                            // Get individual LINES
                                            var item = _a[_i];
                                            var adid = item.ADID;
                                            //CHK FOR 3PBILL		
                                            if (adid === "3PBILL") {
                                                var suno = item.SUNO;
                                                var adte = item.ADTE;
                                                var stdt = item.STDT;

                                                var sunm = item.SUNM;
                                                var adr1 = item.ADR1;
                                                var adr2 = item.ADR2;
                                                var adr3 = item.ADR3;

                                                //UPDATE CUGEX3 RECORD
                                                var myRequest = new MIRequest();
                                                myRequest.program = "CUSEXTMI";
                                                myRequest.transaction = "ChgAlphaKPI";
                                                // output
                                                myRequest.outputFields = [""];
                                                console.log("--------------------------........................frMWS " + frMWS);
                                                console.log("--------------------------........................sunm " + sunm);
                                                console.log("--------------------------........................adr1 " + adr1);
                                                // input
                                                myRequest.record = {
                                                    KPID: "MHDISH",
                                                    PK01: "1",
                                                    PK02: frMWS,
                                                    AL30: sunm,
                                                    AL31: adr1,
                                                    AL32: adr2,
                                                    AL33: adr3

                                                };
                                                MIService.Current.executeRequest(myRequest).then(function (response) {
                                                    // record UPDATE 

                                                    console.log("--------------------------........................recUPDATED ");
                                                })["catch"](function (response) {
                                                    console.log("IN CRS API ERROR----588-------..." + response.errorMessage);
                                                    this.detachEvents();
                                                });
                                            } else {
                                                console.log("--------------------------........................adid " + adid);
                                            }
                                        }
                                    })["catch"](function (response) {
                                        console.log("IN MWS410MI API ERROR-------596----..." + response.errorMessage);
                                        this.detachEvents();
                                    });
                                } else {
                                    //SCENARIO 2 DELIVERY
                                    console.log("   EXITING to SCENARIO 2 DELIVERY-----..."); 
                            var myRequest = new MIRequest();
                            myRequest.program = "MWS410MI";
                            myRequest.transaction = "GetHead";
                            // output
                            myRequest.outputFields = ["CONA", "TEDF"];
                            // input
                            myRequest.record = {
                                DLIX: frMWS,
                            };
                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                var tedf = response.items[0].TEDF;
                                var cona = response.items[0].CONA;

                                console.log("--------------------------.......................cona " + cona);
                                // GET 3RDPARTYY ADDRESS
                                var myRequest = new MIRequest();
                                myRequest.program = "CRS610MI";
                                myRequest.transaction = "GetBasicData";
                                // output
                                // myRequest.outputFields = ["SFI5"];
                              // myRequest.outputFields = ["ADID", "SUNO", "ADTE", "STDT", "SUNM", "ADR1", "ADR2", "ADR3"];
                                  myRequest.outputFields = [ "CUNO", "CUNM", "CUA1", "CUA2", "CUA3"];
                              
                                // input
                                myRequest.record = {
                                    CUNO: cona,
                                    ADRT: "4",
                                    ADID: "3PBILL",

                                };
                                MIService.Current.executeRequest(myRequest).then(function (response) {
                                    var cunm = response.items[0].CUNM;
                                    var adr1 = response.items[0].CUA1;
                                    var adr2 = response.items[0].CUA2;
                                    var adr3 = response.items[0].CUA3;
                                    // get dely terms
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CRS065MI";
                                    myRequest.transaction = "GetDelyTerm";
                                    // output
                                    myRequest.outputFields = ["RCPY"];
                                    // input
                                    console.log("--------------------------........................tedf " + tedf);
                                    myRequest.record = {
                                        TEDL: tedf,
                                        LNCD: "GB",

                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {                       //  
                                        var rcpy = response.items[0].RCPY;
                                        console.log("--------------------------.......................rcpy " + rcpy);
                                        if ((rcpy === "1") || (rcpy === "3")) {
                                            //save CUGEX3 record
                                          

                                            //call api to save
                                            //UPDATE CUGEX3 RECORD
                                            var myRequest = new MIRequest();
                                            myRequest.program = "CUSEXTMI";
                                            myRequest.transaction = "ChgAlphaKPI";
                                            // output
                                            myRequest.outputFields = [""];
                                            // input
                                            myRequest.record = {
                                                KPID: "MHDISH",
                                                PK01: "1",
                                                PK02: frMWS,
                                                AL30: cunm,
                                                AL31: adr1,
                                                AL32: adr2,
                                                AL33: adr3

                                            };
                                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                                // record UPDATE 

                                                console.log("--------------------------...................804.....rec UPDATED ");
                                            })["catch"](function (response) {
                                                console.log("IN  API ERROR-----1---807---..." + response.errorMessage);
                                                this.detachEvents();
                                            });
                                        }

                                    })["catch"](function (response) {
                                        console.log("IN MWS410MI API ERROR---2---632-----..." + response.errorMessage);
                                        this.detachEvents();
                                    });



                                })["catch"](function (response) {
                                    console.log("IN MWS410MI API ERROR----3----732---..." + response.errorMessage);
                                    this.detachEvents();
                                });



                            })["catch"](function (response) {
                                console.log(" API ERROR-----------..." + response.errorMessage);
                                this.detachEvents();
                            });


                                }

                            })["catch"](function (response) {
                                console.log("IN CRS065 API ERROR--502---------..." + response.errorMessage);
                                this.detachEvents();
                            });
                        } else {
                            //SCENARIO 2 FROMDRS
                            console.log(".......SFI5 IS EMPTY GOING TO SCENARIO 2  " + sfi5);
                            var myRequest = new MIRequest();
                            myRequest.program = "MWS410MI";
                            myRequest.transaction = "GetHead";
                            // output
                            myRequest.outputFields = ["CONA", "TEDF"];
                            // input
                            myRequest.record = {
                                DLIX: frMWS,
                            };
                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                var tedf = response.items[0].TEDF;
                                var cona = response.items[0].CONA;

                                console.log("--------------------------.......................cona " + cona);
                                // GET 3RDPARTYY ADDRESS
                                var myRequest = new MIRequest();
                                myRequest.program = "CRS610MI";
                                myRequest.transaction = "GetBasicData";
                                // output
                                // myRequest.outputFields = ["SFI5"];
                               myRequest.outputFields = ["ADID", "SUNO", "ADTE", "STDT", "SUNM", "ADR1", "ADR2", "ADR3"];
                                //  myRequest.outputFields = [ "CUNO", "CUNM", "CUA1", "CUA2", "CUA3"];
                              
                                // input
                                myRequest.record = {
                                    CUNO: cona,
                                    ADRT: "4",
                                    ADID: "3PBILL",

                                };
                                MIService.Current.executeRequest(myRequest).then(function (response) {
                                    // get dely terms
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CRS065MI";
                                    myRequest.transaction = "GetDelyTerm";
                                    // output
                                    myRequest.outputFields = ["RCPY"];
                                    // input
                                    console.log("--------------------------........................tedf " + tedf);
                                    myRequest.record = {
                                        TEDL: tedf,
                                        LNCD: "GB",

                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {                       //  
                                        var rcpy = response.items[0].RCPY;
                                        console.log("--------------------------.......................rcpy " + rcpy);
                                        if ((rcpy === "1") || (rcpy === "3")) {
                                            //save CUGEX3 record
                                            var cunm = response.items[0].CUNM
                                            var adr1 = response.items[0].ADR1
                                            var adr2 = response.items[0].ADR2
                                            var adr3 = response.items[0].ADR3

                                            //call api to save
                                            //UPDATE CUGEX3 RECORD
                                            var myRequest = new MIRequest();
                                            myRequest.program = "CUSEXTMI";
                                            myRequest.transaction = "ChgAlphaKPI";
                                            // output
                                            myRequest.outputFields = [""];
                                            // input
                                            myRequest.record = {
                                                KPID: "MHDISH",
                                                PK01: "1",
                                                PK02: frMWS,
                                                AL30: cunm,
                                                AL31: adr1,
                                                AL32: adr2,
                                                AL33: adr3

                                            };
                                            MIService.Current.executeRequest(myRequest).then(function (response) {
                                                // record UPDATE 

                                                console.log("--------------------------...................804.....rec UPDATED ");
                                            })["catch"](function (response) {
                                                console.log("IN  API ERROR-----1---807---..." + response.errorMessage);
                                                this.detachEvents();
                                            });
                                        }

                                    })["catch"](function (response) {
                                        console.log("IN MWS410MI API ERROR---2---632-----..." + response.errorMessage);
                                        this.detachEvents();
                                    });



                                })["catch"](function (response) {
                                    console.log("IN MWS410MI API ERROR----3----732---..." + response.errorMessage);
                                    this.detachEvents();
                                });



                            })["catch"](function (response) {
                                console.log(" API ERROR-----------..." + response.errorMessage);
                                this.detachEvents();
                            });

                        }

                    })["catch"](function (response) {
                        console.log("IN  API ERROR--4---834------..." + response.errorMessage);
                        // Handle errors here
                        this.detachEvents();
                        // console.log.Info(response.errorMessage);
                    });
                } else {
                    //SCENAIO2 FROMMWS
                    console.log("FWNO IS BLANK -MOVE TO SCENAIO2 FROMMWS--616-------...");
                    var myRequest = new MIRequest();
                    myRequest.program = "MWS410MI";
                    myRequest.transaction = "GetHead";
                    // output
                    myRequest.outputFields = ["CONA", "TEDF"];
                    // input
                    myRequest.record = {
                        DLIX: frMWS,
                    };
                    MIService.Current.executeRequest(myRequest).then(function (response) {
                        var tedf = response.items[0].TEDF;
                        var cona = response.items[0].CONA;

                        console.log("--------------------------.......................cona " + cona);
                        // GET 3RDPARTYY ADDRESS
                        var myRequest = new MIRequest();
                        myRequest.program = "CRS610MI";
                        myRequest.transaction = "GetBasicData";
                        // output
                        // myRequest.outputFields = ["SFI5"];
                        myRequest.outputFields = [ "CUNO", "CUNM", "CUA1", "CUA2", "CUA3"];
                        // input
                        myRequest.record = {
                            CUNO: cona,
                            ADRT: "4",
                            ADID: "3PBILL",

                        };
                        MIService.Current.executeRequest(myRequest).then(function (response) {
                            var cunm = response.items[0].CUNM
                            var adr1 = response.items[0].CUA1
                            var adr2 = response.items[0].CUA2
                            var adr3 = response.items[0].CUA3
                            // get dely terms
                            var myRequest = new MIRequest();
                            myRequest.program = "CRS065MI";
                            myRequest.transaction = "GetDelyTerm";
                            // output
                            myRequest.outputFields = ["RCPY"];
                            // input
                            console.log("--------------------------........................tedf " + tedf);
                            myRequest.record = {
                                TEDL: tedf,
                                LNCD: "GB",

                            };
                            MIService.Current.executeRequest(myRequest).then(function (response) {                       //  
                                var rcpy = response.items[0].RCPY;
                                console.log("--------------------------.......................rcpy " + rcpy);
                                if ((rcpy === "1") || (rcpy === "3")) {
                                 

                                    //call api to save
                                    //UPDATE CUGEX3 RECORD
                                    var myRequest = new MIRequest();
                                    myRequest.program = "CUSEXTMI";
                                    myRequest.transaction = "ChgAlphaKPI";
                                    // output
                                    myRequest.outputFields = [""];
                                    // input
                                    myRequest.record = {
                                        KPID: "MHDISH",
                                        PK01: "1",
                                        PK02: frMWS,
                                        AL30: cunm,
                                        AL31: adr1,
                                        AL32: adr2,
                                        AL33: adr3

                                    };
                                    MIService.Current.executeRequest(myRequest).then(function (response) {
                                        // record UPDATE 

                                        console.log("--------------------------.....................913...rec UPDATED ");
                                    })["catch"](function (response) {
                                        console.log("IN  API ERROR-----1---916---..." + response.errorMessage);
                                        this.detachEvents();
                                    });
                                }else{
                                    console.log("--------------------------.....................900...EXIT SCRIPT RCPY IS " + rcpy);
                                }

                            })["catch"](function (response) {
                                console.log("IN MWS410MI API ERROR---2---711-----..." + response.errorMessage);
                                this.detachEvents();
                            });



                        })["catch"](function (response) {
                            console.log("IN MWS410MI API ERROR----3---841----..." + response.errorMessage);
                            this.detachEvents();
                        });



                    })["catch"](function (response) {
                        console.log(" API ERROR-----------..." + response.errorMessage);
                        this.detachEvents();
                    });

                }
            })["catch"](function (response) {
                console.log("IN MWS410MI API ERROR----854-------..." + response.errorMessage);
                this.detachEvents();
            });

        }


    };
    MWS260_B_UPDATE_DCONSI.prototype.attachEvents = function (controller) {
        var _this = this;
        console.log("--------------------------........................attaching events");
        this.detachRequesting = controller.Requesting.On(function (e) {
            _this.onRequesting(e);
        });

    };
    MWS260_B_UPDATE_DCONSI.prototype.detachEvents = function () {
        console.log("--------------------------........................detachEvents ");
        this.detachRequesting();
        this.detachRequested();
    };
    MWS260_B_UPDATE_DCONSI.prototype.onRequesting = function (args) {
        console.log("--onRequesting------ >>>>>>>>>>>>>>>>>>>>>>>>>>> ");
        // Only Save to DCONSI when printing / gen documents.

        if (args.commandValue === "28" || args.commandValue === "29") {
            var shipNum = ScriptUtil.GetFieldValue("WWCONN");
            console.log("--------------------------........................shipNum " + shipNum);
            // get connected Deliveries
            var items;
            // Init API Call
            var myRequest = new MIRequest();
            myRequest.program = "DRS100MI";
            myRequest.transaction = "LstByDelivery";
            // output
            myRequest.outputFields = ["DLIX"];
            // input
            myRequest.record = {
                CONN: shipNum
            };
            // Calling API
            MIService.Current.executeRequest(myRequest).then(function (response) {
                // Read results here
                var delNo = response.items[0].DLIX;
                console.log("--------------------------........................delNo " + delNo);
                // get address
                var myRequest = new MIRequest();
                myRequest.program = "MWS410MI";
                myRequest.transaction = "GetAdr";
                // output
                myRequest.outputFields = ["NAME", "ADR1", "ADR2", "ADR3"];
                // input
                myRequest.record = {
                    DLIX: delNo,
                    ADRT: "02"
                };
                MIService.Current.executeRequest(myRequest).then(function (response) {
                    var name = response.item.NAME
                    var adr1 = response.item.ADR1
                    var adr2 = response.item.ADR2
                    var adr3 = response.item.ADR3
                    console.log("--------------------------.......................name " + name);
                    
                    console.log("--------------------------.......................adr1 " + adr1);
                    console.log("--------------------------.......................adr2 " + adr2);
                    console.log("--------------------------.......................adr3 " + adr3);
                    //call api to save
                    var myRequest = new MIRequest();
                    myRequest.program = "CUSEXTMI";
                    myRequest.transaction = "ChgFieldValue";
                    // output
                    myRequest.outputFields = [];
                    // input
                    myRequest.record = {
                        FILE: "DCONSI",
                        PK01: shipNum,
                        A230: name,
                        A330: adr1,
                        A430: adr2,
                        A530: adr3
                    };

                    MIService.Current.executeRequest(myRequest).then(function (response) {
                        // record UPDATE 

                        console.log("--------------------------........................recUPDATED " + delNo);
                    })["catch"](function (response) {
                        console.log("IN MWS410MI API ERROR------936-----..." + response.errorMessage);
                        this.detachEvents();
                    });

                })["catch"](function (response) {
                    console.log("IN  API ERROR---5---1029----..." + response.errorMessage);
                    // Handle errors here
                    this.detachEvents();
                    // console.log.Info(response.errorMessage);
                });

            })["catch"](function (response) {
                console.log("IN  API ERROR----6---1036----..." + response.errorMessage);
                // Handle errors here
                this.detachEvents();
                console.log.Info(response.errorMessage);
            });
        } else {
            this.detachEvents();
        }
    };
    return MWS260_B_UPDATE_DCONSI;
}());
