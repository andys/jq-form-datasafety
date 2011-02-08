// jq-form-datasafety sets up a way to stop the user accidently navigating away from pages when they have entered form data and not submitted it
// Andrew Snow <andrew@modulus.org>
// https://github.com/andys/jq-form-datasafety
// v0.1

function init_form_data_safety() {
  // livequery all "datasafe"-tagged forms' elements to save their initial data state into data('data_safety_oldval')
  $('form.datasafe input:not([type=submit][type=hidden]), form.datasafe select, form.datasafe textarea').livequery(function() {
      var MyElem = $(this);
      if(MyElem.is("input[type=checkbox]")) {
        MyElem.data('data_safety_oldval',MyElem.is(":checked") ? "checked" : "");
      } else {
        MyElem.data('data_safety_oldval',MyElem.val());
      }
    }
  );

  // the onsubmit handler will remove the old values when the form is being successfully submitted, so it wont trigger the warning
  var remove_on_submit_handler = function() {
    $(this).find('input:not([type=submit][type=hidden]), select, textarea').each(function() {
        $(this).removeData('data_safety_oldval'); 
        $(this).removeClass('data_safety_warning')
      }
    );
  };

  // this livequery attaches our handler to all forms, in a way that makes sure it is always the FIRST onSubmit handler.
  $('form.datasafe').livequery(function() { 
      var eventlist = $(this).data('events') && $(this).data('events')['submit'] ? $(this).data('events')['submit'] : [];
      eventlist = $.extend(true, [], eventlist);
      $(this).unbind('submit');
      $(this).submit(remove_on_submit_handler);
      var MyFormElem = $(this);
      $.each($(eventlist), function() {
          MyFormElem.submit(this);
        }
      );
    }
  );
}

// Finally, in onBeforeUnload, we trigger the warning message if any of the forms values had changed compared to their original state.
// We also put a red box around the changed data with 'data_safety_warning' class
window.onbeforeunload = function(event) {
  var message = null;
  $('form.datasafe').each(function() {
      $(this).find('input:not([type=submit][type=hidden]),select,textarea').each(function() {
          var MyElem = $(this);
          if(MyElem.is(':visible') && typeof(MyElem.data('data_safety_oldval')) != 'undefined' && (MyElem.is("input[type=checkbox]") ?
               (MyElem.data('data_safety_oldval') != (MyElem.is(":checked") ? "checked" : ""))
             : (MyElem.data('data_safety_oldval') != MyElem.val()))) {
            MyElem.addClass('data_safety_warning')
            message = "Warning: If you continue, your work will not be saved."
          }
        }
      );
    }
  );
  if(message) {
    return message;
  }
}

