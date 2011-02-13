JSDOCDIR=../tools/jsdoc-toolkit
#TEMPLATE=../site/_jsdoc/templates
TEMPLATE=$JSDOCDIR/templates/jsdoc

$JSDOCDIR/jsrun.sh -a -r -t=$TEMPLATE -d=../site/api express-rest

