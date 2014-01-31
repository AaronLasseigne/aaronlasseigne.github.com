BIN=node_modules/.bin/
COGS=$(BIN)cogs

watch:
	$(COGS) -w css

compress:
	$(COGS) -c
