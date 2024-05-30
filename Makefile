all:
	docker-compose up --build

stop:
	@docker stop $$(docker ps -qa)

down:
	@docker compose -f docker-compose.yaml down

kill: stop down

fclean: stop down
	-docker rm $$(docker ps -qa)
	-docker rmi -f $$(docker images -qa)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q)
	-sudo rm -rf ./pgdata
	-docker system prune --all --force

re: fclean all

restart: kill all

.PHONY: all stop re down kill fclean restart
