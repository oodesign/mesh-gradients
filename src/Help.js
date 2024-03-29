export function report_issue() {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("https://github.com/oodesign/mesh-gradients/issues"));
}

export function report_licensing() {

    var subject = encodeURI("Mesh gradients license issue");
    var body = encodeURI("\
  Hi!\
  \n\n\
  Looks like something is not working properly with my Mesh gradients license.\
  \n\n\
  This is the e-mail account I used to get my license on Gumroad:\
  \n\
  And this is my license key:\
  \n\n\
  May you please take a look and come back to me as soon as possible?\
  \n\n\
  Thank you!\
    ");
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("mailto:licensing@oodesign.me?subject=" + subject + "&body=" + body));
}