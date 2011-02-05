#JSDOCDIR=../site/_tools/jsdoc-toolkit $JSDOCDIR/jsrun.sh -a -r \
#	-t=../site/_jsdoc/templates -d=../site/api \
#	express-rest
JSDOCDIR=../site/_tools/jsdoc-toolkit $JSDOCDIR/jsrun.sh -a -r \
	-t=$JSDOCDIR/templates/jsdoc -d=../site/api \
	express-rest
