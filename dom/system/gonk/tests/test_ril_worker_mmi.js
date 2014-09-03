/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

subscriptLoader.loadSubScript("resource://gre/modules/ril_consts.js", this);

function run_test() {
  run_next_test();
}

function testSendMMI(mmi, error) {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  do_print("worker.postMessage " + worker.postMessage);

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({rilMessageType: "sendMMI", mmi: mmi});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(postedMessage.rilMessageType, "sendMMI");
  do_check_eq(postedMessage.errorMsg, error);
}

/**
 * sendMMI tests.
 */

add_test(function test_sendMMI_empty() {
  testSendMMI("", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_undefined() {
  testSendMMI({}, MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_invalid() {
  testSendMMI("11", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_short_code() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  let ussdOptions;

  context.RIL.sendUSSD = function fakeSendUSSD(options){
    ussdOptions = options;
    context.RIL[REQUEST_SEND_USSD](0, {
      rilRequestError: ERROR_SUCCESS
    });

  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "**"});

  let postedMessage = workerhelper.postedMessage;
  do_check_eq(ussdOptions.ussd, "**");
  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);
  do_check_true(context.RIL._ussdSession);

  run_next_test();
});

add_test(function test_sendMMI_dial_string() {
  testSendMMI("123", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.RIL.changeICCPIN = function fakeChangeICCPIN(options) {
    context.RIL[REQUEST_ENTER_SIM_PIN](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "**04*1234*4567*4567#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN_no_new_PIN() {
  testSendMMI("**04*1234**4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN_no_old_PIN() {
  testSendMMI("**04**1234*4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN_wrong_procedure() {
  testSendMMI("*04*1234*4567*4567#", MMI_ERROR_KS_INVALID_ACTION);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN_new_PIN_mismatch() {
  testSendMMI("**04*4567*1234*4567#", MMI_ERROR_KS_MISMATCH_PIN);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN2() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.RIL.changeICCPIN2 = function fakeChangeICCPIN2(options){
    context.RIL[REQUEST_ENTER_SIM_PIN2](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "**042*1234*4567*4567#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN2_no_new_PIN2() {
  testSendMMI("**042*1234**4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN2_no_old_PIN2() {
  testSendMMI("**042**1234*4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN2_wrong_procedure() {
  testSendMMI("*042*1234*4567*4567#", MMI_ERROR_KS_INVALID_ACTION);

  run_next_test();
});

add_test(function test_sendMMI_change_PIN2_new_PIN2_mismatch() {
  testSendMMI("**042*4567*1234*4567#", MMI_ERROR_KS_MISMATCH_PIN);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.RIL.enterICCPUK = function fakeEnterICCPUK(options){
    context.RIL[REQUEST_ENTER_SIM_PUK](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "**05*1234*4567*4567#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN_no_new_PIN() {
  testSendMMI("**05*1234**4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN_no_PUK() {
  testSendMMI("**05**1234*4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN_wrong_procedure() {
  testSendMMI("*05*1234*4567*4567#", MMI_ERROR_KS_INVALID_ACTION);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN_new_PIN_mismatch() {
  testSendMMI("**05*4567*1234*4567#", MMI_ERROR_KS_MISMATCH_PIN);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN2() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.RIL.enterICCPUK2 = function fakeEnterICCPUK2(options){
    context.RIL[REQUEST_ENTER_SIM_PUK2](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "**052*1234*4567*4567#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN2_no_new_PIN2() {
  testSendMMI("**052*1234**4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN2_no_PUK2() {
  testSendMMI("**052**1234*4567#", MMI_ERROR_KS_ERROR);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN2_wrong_procedure() {
  testSendMMI("*052*1234*4567*4567#", MMI_ERROR_KS_INVALID_ACTION);

  run_next_test();
});

add_test(function test_sendMMI_unblock_PIN2_new_PIN_mismatch() {
  testSendMMI("**052*4567*1234*4567#", MMI_ERROR_KS_MISMATCH_PIN);

  run_next_test();
});

add_test(function test_sendMMI_get_IMEI() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let mmiOptions;

  context.RIL.getIMEI = function getIMEI(options){
    mmiOptions = options;
    context.RIL[REQUEST_SEND_USSD](0, {
      rilRequestError: ERROR_SUCCESS,
    });
  };

  context.RIL.sendMMI({mmi: "*#06#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_neq(mmiOptions.mmi, null);
  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_get_IMEI_error() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let mmiOptions;

  context.RIL.getIMEI = function getIMEI(options){
    mmiOptions = options;
    context.RIL[REQUEST_SEND_USSD](0, {
      rilRequestError: ERROR_RADIO_NOT_AVAILABLE,
    });
  };

  context.RIL.sendMMI({mmi: "*#06#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_neq(mmiOptions.mmi, null);
  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_RADIO_NOT_AVAILABLE);
  do_check_false(postedMessage.success);

  run_next_test();
});

add_test(function test_sendMMI_call_barring_BAIC_interrogation_voice() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.Buf.readInt32List = function fakeReadUint32List() {
    return [1];
  };

  context.RIL.queryICCFacilityLock =
    function fakeQueryICCFacilityLock(options){
      context.RIL[REQUEST_QUERY_FACILITY_LOCK](1, {
        rilMessageType: "sendMMI",
        rilRequestError: ERROR_SUCCESS
      });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "*#33#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_true(postedMessage.success);
  do_check_true(postedMessage.enabled);
  do_check_eq(postedMessage.statusMessage,  MMI_SM_KS_SERVICE_ENABLED_FOR);
  do_check_true(Array.isArray(postedMessage.additionalInformation));
  do_check_eq(postedMessage.additionalInformation[0], "serviceClassVoice");

  run_next_test();
});

add_test(function test_sendMMI_call_barring_BAIC_activation() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let mmiOptions;

  context.RIL.setICCFacilityLock =
    function fakeSetICCFacilityLock(options){
      mmiOptions = options;
      context.RIL[REQUEST_SET_FACILITY_LOCK](0, {
        rilMessageType: "sendMMI",
        procedure: MMI_PROCEDURE_ACTIVATION,
        rilRequestError: ERROR_SUCCESS
      });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "*33#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(mmiOptions.procedure, MMI_PROCEDURE_ACTIVATION);
  do_check_true(postedMessage.success);
  do_check_eq(postedMessage.statusMessage,  MMI_SM_KS_SERVICE_ENABLED);

  run_next_test();
});

add_test(function test_sendMMI_call_barring_BAIC_deactivation() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let mmiOptions;

  context.RIL.setICCFacilityLock =
    function fakeSetICCFacilityLock(options){
      mmiOptions = options;
      context.RIL[REQUEST_SET_FACILITY_LOCK](0, {
        rilMessageType: "sendMMI",
        procedure: MMI_PROCEDURE_DEACTIVATION,
        rilRequestError: ERROR_SUCCESS
      });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "#33#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(mmiOptions.procedure, MMI_PROCEDURE_DEACTIVATION);
  do_check_true(postedMessage.success);
  do_check_eq(postedMessage.statusMessage,  MMI_SM_KS_SERVICE_DISABLED);

  run_next_test();
});

add_test(function test_sendMMI_call_barring_BAIC_procedure_not_supported() {
  testSendMMI("**33*0000#", MMI_ERROR_KS_NOT_SUPPORTED);

  run_next_test();
});

add_test(function test_sendMMI_USSD() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let ussdOptions;

  context.RIL.sendUSSD = function fakeSendUSSD(options){
    ussdOptions = options;
    context.RIL[REQUEST_SEND_USSD](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "*123#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(ussdOptions.ussd, "*123#");
  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);
  do_check_true(context.RIL._ussdSession);

  run_next_test();
});

add_test(function test_sendMMI_USSD_error() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];
  let ussdOptions;

  context.RIL.sendUSSD = function fakeSendUSSD(options){
    ussdOptions = options;
    context.RIL[REQUEST_SEND_USSD](0, {
      rilRequestError: ERROR_GENERIC_FAILURE
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "*123#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(ussdOptions.ussd, "*123#");
  do_check_eq (postedMessage.errorMsg, GECKO_ERROR_GENERIC_FAILURE);
  do_check_false(postedMessage.success);
  do_check_false(context.RIL._ussdSession);

  run_next_test();
});

function setCallWaitingSuccess(mmi) {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.RIL.setCallWaiting = function fakeSetCallWaiting(options) {
    context.RIL[REQUEST_SET_CALL_WAITING](0, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: mmi});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);
}

add_test(function test_sendMMI_call_waiting_activation() {
  setCallWaitingSuccess("*43*10#");

  run_next_test();
});

add_test(function test_sendMMI_call_waiting_deactivation() {
  setCallWaitingSuccess("#43#");

  run_next_test();
});

add_test(function test_sendMMI_call_waiting_registration() {
  testSendMMI("**43#", MMI_ERROR_KS_NOT_SUPPORTED);

  run_next_test();
});

add_test(function test_sendMMI_call_waiting_erasure() {
  testSendMMI("##43#", MMI_ERROR_KS_NOT_SUPPORTED);

  run_next_test();
});

add_test(function test_sendMMI_call_waiting_interrogation() {
  let workerhelper = newInterceptWorker();
  let worker = workerhelper.worker;
  let context = worker.ContextPool._contexts[0];

  context.Buf.readInt32 = function fakeReadUint32() {
    return context.Buf.int32Array.pop();
  };

  context.RIL.queryCallWaiting = function fakeQueryCallWaiting(options) {
    context.Buf.int32Array = [
      7,   // serviceClass
      1,   // enabled
      2    // length
    ];
    context.RIL[REQUEST_QUERY_CALL_WAITING](1, {
      rilRequestError: ERROR_SUCCESS
    });
  };

  context.RIL.radioState = GECKO_RADIOSTATE_ENABLED;
  context.RIL.sendMMI({mmi: "*#43#"});

  let postedMessage = workerhelper.postedMessage;

  do_check_eq(postedMessage.errorMsg, GECKO_ERROR_SUCCESS);
  do_check_true(postedMessage.success);
  do_check_eq(postedMessage.length, 2);
  do_check_true(postedMessage.enabled);
  run_next_test();
});
